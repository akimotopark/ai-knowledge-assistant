// scripts/resetChroma.js
require('dotenv').config();
const { ChromaClient } = require('chromadb');

const chroma = new ChromaClient({ path: process.env.CHROMA_URL });

async function reset() {
    try {
        // List all collections first
        const collections = await chroma.listCollections();
        console.log("Existing collections:", collections);

        // Delete the corrupted collection
        await chroma.deleteCollection({ name: "documents" });
        console.log("✅ Deleted 'documents' collection");

        // Verify it's gone
        const remaining = await chroma.listCollections();
        console.log("Remaining collections:", remaining);

    } catch (err) {
        console.error("Error:", err.message);
    }
}

reset();