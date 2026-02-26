require('dotenv').config();
const amqp = require('amqplib');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const { ChromaClient } = require('chromadb');
const OpenAI = require('openai');
const DocumentContent = require('./models/documentContent');

// connect open AI api
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENAI_API_KEY,
});

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

//generate embeddings
async function generateEmbedding(text) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
}

//store vector in chroma
async function storeInChroma(documentId, chunks, embeddings) {
    const collection = await chroma.getOrCreateCollection({
        name: 'documents',
        embeddingFunction: { generate: (texts) => Promise.resolve([]) }
    });

    await collection.add({
        ids: chunks.map((_, i) => `${documentId}-${i}`),
        embeddings: embeddings,
        documents: chunks,
        metadatas: chunks.map(() => ({
            documentId: documentId,
        })),
    });
}

async function startWorker() {
    // Wait for services to be ready
    console.log("Waiting for services to start...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('document_queue', { durable: true });
    console.log("worker waiting for the message ....");

    channel.consume('document_queue', async (msg) => {
        const { documentId } = JSON.parse(msg.content.toString());

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

            // 3️⃣ Generate embeddings
            const embeddings = await Promise.all(
                chunks.map(chunk => generateEmbedding(chunk))
            );

            // 4️⃣ Store in Chroma
            await storeInChroma(documentId, chunks, embeddings);

            // 5️⃣ Update status in PostgreSQL
            await pool.query(
                'UPDATE documents SET status = $1, processed_at = NOW() WHERE id = $2',
                ['processed', documentId]
            );

            console.log(`✅ Document ${documentId} processed successfully`);
        } catch (error) {
            console.error('Error processing document:', error);
            channel.nack(msg);
        }
    });
}

startWorker();