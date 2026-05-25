// backend/socket/index.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Track online users: userId -> socketId
const onlineUsers = new Map();
let ioInstance = null;

const sendNotificationToUser = (userId, eventName, data) => {
  if (ioInstance) {
    const socketId = onlineUsers.get(userId);
    if (socketId) {
      ioInstance.to(socketId).emit(eventName, data);
    }
  }
};

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust to match your frontend URL in production
      methods: ["GET", "POST"]
    },
    transports: ['websocket']
  });
  
  ioInstance = io;

  // Authentication Middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    onlineUsers.set(userId, socket.id);
    
    // Broadcast user online status
    io.emit('user_status', { userId, status: 'online' });
    
    // Send list of currently online users to the newly connected client
    socket.emit('online_users_list', Array.from(onlineUsers.keys()));
 
    socket.on('join_room', (data) => {
      const { otherUserId } = data;
      // Deterministic room name: room_smallerId_largerId
      const roomId = `room_${[userId, otherUserId].sort().join('_')}`;
      socket.join(roomId);
    });
 
    socket.on('send_message', async (data) => {
      const { receiver_id, content, image_url = null } = data;
      const roomId = `room_${[userId, receiver_id].sort().join('_')}`;
 
      try {
        const receiverSocketId = onlineUsers.get(receiver_id);
        const isRead = false;
        const isDelivered = receiverSocketId ? true : false;

        // Persist to DB (using the image_url field)
        const newMessage = await db.query(
          'INSERT INTO messages (sender_id, receiver_id, content, image_url, is_read) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [userId, receiver_id, content, image_url, isRead]
        );
 
        const messageData = newMessage.rows[0];
        messageData.is_delivered = isDelivered;
 
        // Emit to the room
        io.to(roomId).emit('receive_message', messageData);
        
        // Emit notification to receiver
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message_notification', messageData);
          
          // Trigger persistent DB notification
          const senderRes = await db.query('SELECT name FROM users WHERE id = $1', [userId]);
          const senderName = senderRes.rows[0]?.name || 'Someone';
          
          // Import notificationService dynamically to avoid circular dependencies
          const notificationService = require('../services/notificationService');
          await notificationService.createNotification(
            receiver_id,
            'New Message',
            `${senderName} sent you a message: "${content ? content.substring(0, 30) : 'Sent an image'}"`,
            'New Message'
          );
        }
      } catch (err) {
        console.error('Socket error - send_message:', err);
      }
    });

    socket.on('mark_read', async (data) => {
      const { sender_id } = data;
      const roomId = `room_${[userId, sender_id].sort().join('_')}`;
      
      try {
        // Update database
        await db.query(
          'UPDATE messages SET is_read = true WHERE sender_id = $1 AND receiver_id = $2',
          [sender_id, userId]
        );
        
        // Notify room and sender
        socket.to(roomId).emit('messages_read', { readerId: userId, senderId: sender_id });
        
        const senderSocketId = onlineUsers.get(sender_id);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_read', { readerId: userId, senderId: sender_id });
        }
      } catch (err) {
        console.error('Socket error - mark_read:', err);
      }
    });
 
    socket.on('typing', (data) => {
      const { receiver_id } = data;
      const roomId = `room_${[userId, receiver_id].sort().join('_')}`;
      socket.to(roomId).emit('typing', { userId });
    });
 
    socket.on('stop_typing', (data) => {
      const { receiver_id } = data;
      const roomId = `room_${[userId, receiver_id].sort().join('_')}`;
      socket.to(roomId).emit('stop_typing', { userId });
    });
 
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user_status', { userId, status: 'offline' });
    });
  });

  return io;
};

module.exports = { initSocket, onlineUsers, sendNotificationToUser };
