// frontend/src/services/profileService.js
import api from './api';

const profileService = {
  getProfile: async (id) => {
    const response = await api.get(`/profile/${id}`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  getTrustScore: async (id) => {
    const response = await api.get(`/profile/${id}/trust-score`);
    return response.data;
  }
};

export default profileService;
