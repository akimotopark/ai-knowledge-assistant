const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function generateText(prompt) {
    const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content;
}

async function generateEmbedding(text) {
    const response = await openai.embeddings.create({
        model: process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small",
        input: text,
    });
    return response.data[0].embedding;
}

module.exports = {
    generateText,
    generateEmbedding
};
