// frontend/src/services/messageService.js
import api from './api';

const messageService = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  getMessages: async (otherUserId) => {
    const response = await api.get(`/messages/${otherUserId}`);
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  markAsRead: async (otherUserId) => {
    const response = await api.put(`/messages/read/${otherUserId}`);
    return response.data;
  }
};

export default messageService;
