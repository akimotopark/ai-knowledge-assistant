const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { askQuestion } = require('../controllers/ragController');

router.post('/ask', authenticate, askQuestion);

module.exports = router;
