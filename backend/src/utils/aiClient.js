const { ChromaClient } = require('chromadb');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const geminiEmbeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
const geminiLanguageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const chroma = new ChromaClient({
    path: process.env.CHROMA_URL,
});

module.exports = {
    chroma,
    geminiEmbeddingModel,
    geminiLanguageModel
};
