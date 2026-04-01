import api from './api';

const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  getAllReviews: async () => {
    const response = await api.get('/admin/reviews');
    return response.data;
  }
};

export default adminService;
