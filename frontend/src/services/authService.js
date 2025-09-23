import API from './api';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] || 
                          error.message || 
                          'Login failed';
      throw new Error(errorMessage);
    }
  },

  registerClient: async (clientData) => {
    try {
      const response = await API.post('/client/register', clientData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  },

  registerDoctor: async (doctorData) => {
    try {
      const response = await API.post('/doctor/register', doctorData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  },

  getProfile: async () => {
    try {
      const response = await API.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get profile');
    }
  },

  logout: async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    }
  }
};