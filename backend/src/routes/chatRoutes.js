const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
    getSessions,
    createNewSession,
    removeSession,
    getMessages,
    sendMessage
} = require('../controllers/chatController');

router.get('/sessions', authenticate, getSessions);
router.post('/sessions', authenticate, createNewSession);
router.delete('/sessions/:id', authenticate, removeSession);

router.get('/sessions/:id/messages', authenticate, getMessages);
router.post('/sessions/:id/messages', authenticate, sendMessage);

module.exports = router;
