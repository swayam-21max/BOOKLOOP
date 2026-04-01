import api from './api';

const authService = {
  register: async (userData) => {
    // Simplified registration without OTP
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  login: async (credentials) => {
    // Step 1: Verify credentials and trigger OTP
    const response = await api.post('/auth/login', credentials);
    return response.data; // Will contain { requiresOTP: true }
  },

  verifyLoginOTP: async (email, otp) => {
    // Step 2: Verify OTP and get token
    const response = await api.post('/auth/login/verify', { email, otp });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  updateProfilePic: async (formData) => {
    const response = await api.put('/auth/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  }
};

export default authService;
