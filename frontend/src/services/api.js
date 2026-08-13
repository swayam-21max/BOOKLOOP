import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
    return import.meta.env.VITE_API_URL;
  }
  return import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
});

// Interceptor to add JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
    }
    return Promise.reject(error);
  }
);

export default api;
