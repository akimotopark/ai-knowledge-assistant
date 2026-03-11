const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { listDocuments } = require('../controllers/adminController');

router.get(
    '/documents',
    authenticate,
    authorize('admin'),
    listDocuments
);

module.exports = router;