// services/api.js - CORRECTED FOR YOUR SERVER

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5011/api', // ⬅️ YOUR ACTUAL SERVER URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request logging
API.interceptors.request.use(
  (config) => {
    console.log('🚀 Making API request:', {
      method: config.method.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      data: config.data ? { ...config.data, Password: config.data.Password ? '***' : undefined } : undefined
    });
    return config;
  },
  (error) => {
    console.error('❌ Request setup failed:', error);
    return Promise.reject(error);
  }
);

// Add response logging
API.interceptors.response.use(
  (response) => {
    console.log('✅ API response received:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // More helpful error messages
    if (error.code === 'ECONNREFUSED') {
      error.message = 'Cannot connect to server - make sure it\'s running on http://localhost:5011';
    } else if (error.response?.status === 404) {
      error.message = 'API endpoint not found - check your controller routing';
    } else if (error.response?.status === 401) {
      error.message = 'Invalid username or password';
    }
    
    return Promise.reject(error);
  }
);

export default API;