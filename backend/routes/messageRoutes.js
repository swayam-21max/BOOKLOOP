// backend/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.get('/conversations', auth, messageController.getConversations);
router.get('/:otherUserId', auth, messageController.getMessages);
router.put('/read/:otherUserId', auth, messageController.markAsRead);
// Note: sendMessage is primarily handled via Socket.io now, but keeping HTTP for fallback if needed
router.post('/', auth, messageController.sendMessage);

module.exports = router;
