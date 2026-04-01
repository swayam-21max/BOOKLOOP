// backend/socket/index.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Track online users: userId -> socketId
const onlineUsers = new Map();

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust to match your frontend URL in production
      methods: ["GET", "POST"]
    },
    transports: ['websocket']
  });

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

    socket.on('join_room', (data) => {
      const { otherUserId } = data;
      // Deterministic room name: room_smallerId_largerId
      const roomId = `room_${[userId, otherUserId].sort().join('_')}`;
      socket.join(roomId);
    });

    socket.on('send_message', async (data) => {
      const { receiver_id, content } = data;
      const roomId = `room_${[userId, receiver_id].sort().join('_')}`;

      try {
        // Persist to DB
        const newMessage = await db.query(
          'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
          [userId, receiver_id, content]
        );

        const messageData = newMessage.rows[0];

        // Emit to the room
        io.to(roomId).emit('receive_message', messageData);
        
        // Also emit a notification/update to the receiver if they are not in the room
        // This helps update the conversation list in real-time
        const receiverSocketId = onlineUsers.get(receiver_id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message_notification', messageData);
        }
      } catch (err) {
        console.error('Socket error - send_message:', err);
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

module.exports = { initSocket, onlineUsers };
