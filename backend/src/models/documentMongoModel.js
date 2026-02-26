const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    documentId: Number,
    filename: String,
    content: String,
}, {
    timestamps: true,
    collection: 'documents'
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;