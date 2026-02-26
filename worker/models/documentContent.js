const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    documentId: Number,
    filename: String,
    content: String
}, { timestamps: true });

module.exports = mongoose.model('DocumentContent', documentSchema);