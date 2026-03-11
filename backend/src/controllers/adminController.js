const { getAllDocuments } = require('../models/documentModel');

const listDocuments = async (req, res) => {
    try {
        const documents = await getAllDocuments();
        res.status(200).json(documents);
    } catch (error) {
        console.error('Error listing documents:', error);
        res.status(500).json({ message: 'Failed to list documents' });
    }
}

module.exports = {
    listDocuments
}