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
  },
  banUser: async (id) => {
    const response = await api.put(`/admin/users/${id}/ban`);
    return response.data;
  },
  suspendUser: async (id) => {
    const response = await api.put(`/admin/users/${id}/suspend`);
    return response.data;
  },
  activateUser: async (id) => {
    const response = await api.put(`/admin/users/${id}/activate`);
    return response.data;
  },
  resetPassword: async (id, newPassword) => {
    const response = await api.put(`/admin/users/${id}/reset-password`, { newPassword });
    return response.data;
  },
  getReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },
  updateReportStatus: async (id, status) => {
    const response = await api.put(`/reports/${id}/status`, { status });
    return response.data;
  }
};

export default adminService;
