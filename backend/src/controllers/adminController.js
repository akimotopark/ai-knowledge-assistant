const { getAllDocuments, deleteDocumentMetaData } = require('../models/documentModel');
const DocumentContent = require('../models/documentMongoModel');
const { chroma } = require('../utils/aiClient');

const listDocuments = async (req, res) => {
    try {
        const documents = await getAllDocuments();
        res.status(200).json(documents);
    } catch (error) {
        console.error('Error listing documents:', error);
        res.status(500).json({ message: 'Failed to list documents' });
    }
}

const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Starting deletion for document ID: ${id}`);

        // 1️⃣ Delete from ChromaDB
        try {
            const collection = await chroma.getCollection({ name: "documents" });
            // Chroma metadata is stored as numbers or strings; we'll remove chunks matching this id
            await collection.delete({
                where: { documentId: Number(id) }
            });
            console.log(`✅ Deleted chunks from Chroma for doc: ${id}`);
        } catch (chromaError) {
            console.error('Chroma deletion error (might be empty):', chromaError.message);
        }

        // 2️⃣ Delete from MongoDB (Document Content chunks)
        await DocumentContent.deleteMany({ documentId: id });
        console.log(`✅ Deleted content from Mongo for doc: ${id}`);

        // 3️⃣ Delete from PostgreSQL (Metadata)
        await deleteDocumentMetaData(id);
        console.log(`✅ Deleted metadata from Postgres for doc: ${id}`);

        res.status(200).json({ message: 'Document deleted successfully from all systems' });
    } catch (error) {
        console.error('Error during document deletion:', error);
        res.status(500).json({ message: 'Failed to delete document', details: error.message });
    }
}

module.exports = {
    listDocuments,
    deleteDocument
}