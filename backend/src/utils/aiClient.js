const OpenAI = require('openai');
const { ChromaClient } = require('chromadb');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const geminiEmbeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
const geminiLanguageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const chroma = new ChromaClient({
    path: process.env.CHROMA_URL,
});

module.exports = {
    openai,
    chroma,
    geminiEmbeddingModel,
    geminiLanguageModel
};
