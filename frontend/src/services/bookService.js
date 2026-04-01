import api from './api';

const bookService = {
  getBooks: async (params) => {
    const response = await api.get('/books', { params });
    return response.data;
  },
  getBookById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },
  createBook: async (bookData) => {
    // If bookData is FormData, axios handles it automatically
    const response = await api.post('/books', bookData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  updateBookStatus: async (id, status) => {
    const response = await api.put(`/books/${id}/status`, { status });
    return response.data;
  },
  getMyBooks: async () => {
    const response = await api.get('/books/my-books');
    return response.data;
  },
  getPendingBooks: async () => {
    const response = await api.get('/books/pending');
    return response.data;
  },
  deleteBook: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  }
};

export default bookService;
