const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const embeddingModel = genAI.getGenerativeModel({ model: process.env.GEMINI_EMBED_MODEL || "gemini-embedding-001" });
const languageModel = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });

async function generateText(prompt) {
    const result = await languageModel.generateContent(prompt);
    return result.response.text();
}

async function generateEmbedding(text, taskType = "RETRIEVAL_DOCUMENT") {
    const result = await embeddingModel.embedContent({
        content: { parts: [{ text }] },
        taskType: taskType,
    });
    return result.embedding.values;
}

module.exports = {
    generateText,
    generateEmbedding
};
