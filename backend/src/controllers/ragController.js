const { chroma, llm } = require("../utils/aiClient");

async function askQuestion(req, res) {
    try {
        const { question, documentId } = req.body;
        if (!question) {
            return res.status(400).json({ message: "Question is required" });
        }
        // 1️⃣ Generate embedding for question
        const queryEmbedding = await llm.generateEmbedding(question, "RETRIEVAL_QUERY");
        // 2️⃣ Query Chroma
        console.log("Querying Chroma for question:", question);
        const collection = await chroma.getOrCreateCollection({
            name: "documents",
        });

        const results = await collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: 5
        });

        console.log("Chroma query results:", JSON.stringify(results, null, 2));
        const retrievedDocs = results.documents[0] || [];

        if (retrievedDocs.length === 0) {
            console.log("No documents found in Chroma for this query.");
            return res.status(404).json({ answers: "No documents found" });
        }

        // 3️⃣ Construct context
        const context = retrievedDocs.join("\n\n");

        const prompt = `
        You are an enterprise knowledge assistant. Answer the question based ONLY on the context below.
        Context: ${context}
        Question: ${question}
        Answer: 
        `;

        // 4️⃣ Call LLM
        console.log("Calling LLM with prompt context length:", context.length);
        const answer = await llm.generateText(prompt);

        console.log("LLM response received successfully");
        return res.json({ answer });
    } catch (error) {
        console.error("Error processing RAG query:", error);
        return res.status(500).json({ error: "Failed to process document", details: error.message });
    }
}

module.exports = {
    askQuestion,
};