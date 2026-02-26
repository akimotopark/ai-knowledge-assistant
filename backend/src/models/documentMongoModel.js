const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    documentId: Number,
    filenName: String,
    content: String,
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;