import api from './api';

const wishlistService = {
  getWishlists: async () => {
    const response = await api.get('/wishlists');
    return response.data;
  },
  addWishlist: async (alertData) => {
    const payload = typeof alertData === 'string' ? { query: alertData } : alertData;
    const response = await api.post('/wishlists', payload);
    return response.data;
  },
  addBookToWishlist: async (bookId) => {
    const response = await api.post('/wishlists', { book_id: bookId });
    return response.data;
  },
  deleteWishlist: async (id) => {
    const response = await api.delete(`/wishlists/${id}`);
    return response.data;
  }
};

export default wishlistService;
