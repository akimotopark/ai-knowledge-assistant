const express = require('express');
const router = express.Router();
const { upload, uploadDocument } = require('../controllers/documentController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/upload', authenticate, upload.single('file'), uploadDocument);

module.exports = router;