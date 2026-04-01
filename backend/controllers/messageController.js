// backend/controllers/messageController.js
const db = require('../config/db');

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;

    const newMessage = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
      [sender_id, receiver_id, content]
    );

    res.status(201).json(newMessage.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.id;

    const messages = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1) 
       ORDER BY timestamp ASC`,
      [userId, otherUserId]
    );

    res.json(messages.rows);
  } catch (err) {
    next(err);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get unique users the current user has chatted with, along with last message
    const conversations = await db.query(
      `SELECT DISTINCT ON (other_user_id)
        u.id, 
        u.name, 
        u.role,
        m.content as last_message,
        m.timestamp as last_timestamp,
        m.sender_id as last_sender_id
      FROM (
        SELECT 
          CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as other_user_id,
          content,
          timestamp,
          sender_id
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
        ORDER BY timestamp DESC
      ) m
      JOIN users u ON u.id = m.other_user_id
      ORDER BY other_user_id, last_timestamp DESC`,
      [userId]
    );

    // Sort by most recent first in JS (DISTINCT ON requires ordering by the distinct column first)
    const sortedConvos = conversations.rows.sort((a, b) => 
      new Date(b.last_timestamp) - new Date(a.last_timestamp)
    );

    res.json(sortedConvos);
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.id;

    await db.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE',
      [otherUserId, userId]
    );

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    next(err);
  }
};
