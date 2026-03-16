const { ChromaClient } = require('chromadb');
const llm = require('./llmProvider');

const chroma = new ChromaClient({
    path: process.env.CHROMA_URL,
});

module.exports = {
    chroma,
    llm
};
