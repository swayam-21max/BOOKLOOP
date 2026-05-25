// frontend/src/services/favoritesService.js
import api from './api';

const favoritesService = {
  getFavorites: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },

  addToFavorites: async (bookId) => {
    const response = await api.post('/favorites', { book_id: bookId });
    return response.data;
  },

  removeFromFavorites: async (bookId) => {
    const response = await api.delete(`/favorites/${bookId}`);
    return response.data;
  }
};

export default favoritesService;
