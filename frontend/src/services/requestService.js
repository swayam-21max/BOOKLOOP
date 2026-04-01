import api from './api';

const requestService = {
  createRequest: async (book_id) => {
    const response = await api.post('/requests', { book_id });
    return response.data;
  },
  acceptRequest: async (id) => {
    const response = await api.put(`/requests/${id}/accept`);
    return response.data;
  },
  getIncomingRequests: async () => {
    const response = await api.get('/requests/incoming');
    return response.data;
  },
  getMyRequests: async () => {
    const response = await api.get('/requests/my-requests');
    return response.data;
  }
};

export default requestService;
