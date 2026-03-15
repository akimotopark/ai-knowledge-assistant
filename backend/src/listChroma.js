const { chroma } = require('./utils/aiClient');

async function listChromaData() {
    try {
        console.log("Fetching collections...");
        const collectionNames = await chroma.listCollections();
        console.log("Found collections:", collectionNames);

        for (const name of collectionNames) {
            console.log(`\n--- Collection: ${name} ---`);
            const collection = await chroma.getCollection({ name: name });
            const count = await collection.count();
            console.log(`Item count: ${count}`);

            if (count > 0) {
                const data = await collection.get({
                    limit: 10,
                    include: ['metadatas', 'documents']
                });
                console.log("Recent items:");
                data.ids.forEach((id, index) => {
                    console.log(`ID: ${id}`);
                    console.log(`Metadata:`, data.metadatas[index]);
                    console.log(`Content snippet: ${data.documents[index]?.substring(0, 100)}...`);
                    console.log('---');
                });
            }
        }
    } catch (error) {
        console.error("Error listing Chroma data:", error);
    } finally {
        process.exit();
    }
}

listChromaData();
