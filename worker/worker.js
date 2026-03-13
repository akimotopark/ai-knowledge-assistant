require('dotenv').config();
const amqp = require('amqplib');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const { ChromaClient } = require('chromadb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const DocumentContent = require('./models/documentContent');

// connect Gemini AI api
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const geminiEmbeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

//create chroma 
const chroma = new ChromaClient({ path: process.env.CHROMA_URL });

//postgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Worker connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));


//Chunking function 
function chunkText(text, chunkSize = 500, overlap = 50) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}

//generate embeddings using Gemini
async function generateEmbedding(text) {
    const response = await geminiEmbeddingModel.embedContent({
        content: { parts: [{ text }] },
        taskType: "RETRIEVAL_DOCUMENT",
    });
    return response.embedding.values;
}

//store vector in chroma
async function storeInChroma(documentId, chunks, embeddings) {
    console.log(`Storing ${chunks.length} chunks for document ${documentId} in Chroma...`);
    const collection = await chroma.getOrCreateCollection({
        name: 'documents',
        metadata: { "hnsw:space": "cosine" }
    });

    await collection.add({
        ids: chunks.map((_, i) => `${documentId}-${i}`),
        embeddings: embeddings,
        documents: chunks,
        metadatas: chunks.map(() => ({
            documentId: documentId,
        })),
    });
    console.log(`Successfully added to Chroma collection`);
}

async function startWorker() {
    // Wait for services to be ready
    console.log("Waiting for services to start...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('document_queue', { durable: true });
    await channel.prefetch(1);
    console.log("worker waiting for the message ....");

    channel.consume('document_queue', async (msg) => {
        if (!msg) return;
        const messageContent = msg.content.toString();
        console.log(`[Worker] Received message from queue: ${messageContent}`);
        const { documentId } = JSON.parse(messageContent);

        console.log(`Processing document ${documentId}`);

        try {
            // 1️⃣ Get document from Mongo
            const document = await DocumentContent.findOne({ documentId });

            if (!document) {
                console.log('Document not found in MongoDB');
                channel.ack(msg); //remove the message from the queue
                return;
            }

            // 2️⃣ Chunk the content
            const chunks = chunkText(document.content);

            // 3️⃣ Generate embeddings (in batches to avoid high CPU/Memory/Rate-limits)
            console.log(`Generating embeddings for ${chunks.length} chunks...`);
            const embeddings = [];
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                try {
                    const embedding = await generateEmbedding(chunk);
                    embeddings.push(embedding);
                    console.log(`  Processed ${i + 1}/${chunks.length} chunks...`);
                    // Delay to stay within Gemini free tier rate limits (~15 RPM)
                    await new Promise(resolve => setTimeout(resolve, 0));
                } catch (err) {
                    if (err.status === 429) {
                        console.log("Rate limit hit, waiting 30 seconds...");
                        await new Promise(resolve => setTimeout(resolve, 30000));
                        i--; // Retry this chunk
                    } else {
                        throw err;
                    }
                }
            }

            // 4️⃣ Store in Chroma
            await storeInChroma(documentId, chunks, embeddings);

            // 5️⃣ Update status in PostgreSQL
            await pool.query(
                'UPDATE documents SET status = $1, processed_at = NOW() WHERE id = $2',
                ['processed', documentId]
            );

            console.log(`✅ Document ${documentId} processed successfully`);
            channel.ack(msg);
        } catch (error) {
            console.error('Error processing document:', error);
            // Don't requeue if it's a credits or connection issue to avoid CPU spike
            channel.nack(msg, false, false);
        }
    });
}

startWorker();