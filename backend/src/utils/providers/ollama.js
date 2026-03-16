const fetch = require('node-fetch');

const BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

async function generateText(prompt) {
    const res = await fetch(`${BASE_URL}/api/generate`, {
        method: 'POST',
        body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || 'llama3',
            prompt: prompt,
            stream: false
        }),
    });
    const data = await res.json();
    return data.response;
}

async function generateEmbedding(text) {
    const res = await fetch(`${BASE_URL}/api/embeddings`, {
        method: 'POST',
        body: JSON.stringify({
            model: process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text',
            prompt: text
        }),
    });
    const data = await res.json();
    return data.embedding;
}

module.exports = {
    generateText,
    generateEmbedding
};
