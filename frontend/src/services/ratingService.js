// frontend/src/services/ratingService.js
import api from './api';

const ratingService = {
  submitRating: async (ratingData) => {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  },
  getUserRatings: async (userId) => {
    const response = await api.get(`/ratings/${userId}`);
    return response.data;
  },
  deleteRating: async (id) => {
    const response = await api.delete(`/ratings/${id}`);
    return response.data;
  }
};

export default ratingService;
