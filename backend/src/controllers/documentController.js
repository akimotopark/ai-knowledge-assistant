const multer = require('multer');
const DocumentContent = require('../models/documentMongoModel');
const { createDocumentMetaData } = require('../models/documentModel');
const { publishToQueue } = require('../utils/rabbitmq');

const upload = multer({
    storage: multer.memoryStorage()
});

const uploadDocument = async (req, res) => {
    try {
        const { title, description } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // 1️⃣ Save metadata in PostgreSQL
        const metadata = await createDocumentMetaData(
            title,
            description,
            req.user.id
        );

        // 2️⃣ Save raw content in MongoDB
        await DocumentContent.create({
            documentId: metadata.id,
            filename: file.originalname,
            content: file.buffer.toString()
        });

        // 3️⃣ Publish job to queue
        await publishToQueue({
            documentId: metadata.id
        });

        res.status(201).json({ message: 'Document uploaded successfully', metadata });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Failed to upload document' });
    }
};

module.exports = {
    upload,
    uploadDocument
}