// backend/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');
const { uploadChat } = require('../middleware/upload');

router.get('/conversations', auth, messageController.getConversations);
router.get('/:otherUserId', auth, messageController.getMessages);
router.put('/read/:otherUserId', auth, messageController.markAsRead);
router.post('/upload', auth, uploadChat.single('image'), messageController.uploadImage);
router.post('/', auth, messageController.sendMessage);

module.exports = router;
