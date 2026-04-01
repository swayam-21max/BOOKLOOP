// frontend/src/socket/socketClient.js
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Adjust for production

let socket;

export const connectSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
