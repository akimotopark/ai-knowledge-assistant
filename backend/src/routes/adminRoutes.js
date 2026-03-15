const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { listDocuments, deleteDocument } = require('../controllers/adminController');

router.get(
    '/documents',
    authenticate,
    authorize('admin'),
    listDocuments
);

router.delete(
    '/documents/:id',
    authenticate,
    authorize('admin'),
    deleteDocument
);

module.exports = router;