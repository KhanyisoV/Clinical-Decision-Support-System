import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5011/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle authentication errors and API responses
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication Service
export const authService = {
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify({
          userName: response.data.data.userName,
          role: response.data.data.role
        }));
        return response.data;
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  },

  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Admin Service
export const adminService = {
  // Dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await API.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  },

  // Client Management
  getAllClients: async () => {
    try {
      const response = await API.get('/admin/clients');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch clients');
    }
  },

  createClient: async (clientData) => {
    try {
      const response = await API.post('/admin/clients', clientData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create client');
    }
  },

  updateClient: async (username, clientData) => {
    try {
      const response = await API.put(`/admin/clients/${username}`, clientData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update client');
    }
  },

  deleteClient: async (username) => {
    try {
      const response = await API.delete(`/admin/clients/${username}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete client');
    }
  },

  // Doctor Management
  getAllDoctors: async () => {
    try {
      const response = await API.get('/admin/doctors');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch doctors');
    }
  },

  createDoctor: async (doctorData) => {
    try {
      const response = await API.post('/admin/doctors', doctorData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create doctor');
    }
  },

  updateDoctor: async (username, doctorData) => {
    try {
      const response = await API.put(`/admin/doctors/${username}`, doctorData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update doctor');
    }
  },

  deleteDoctor: async (username) => {
    try {
      const response = await API.delete(`/admin/doctors/${username}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete doctor');
    }
  },

  // Admin Management
  getAllAdmins: async () => {
    try {
      const response = await API.get('/admin');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admins');
    }
  },

  createAdmin: async (adminData) => {
    try {
      const response = await API.post('/admin', adminData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create admin');
    }
  }
};

// Client Service
export const clientService = {
  getProfile: async (username) => {
    try {
      const response = await API.get(`/client/profile/${username}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  updateProfile: async (username, profileData) => {
    try {
      const response = await API.put(`/client/profile/${username}`, profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }
};

// Doctor Service
export const doctorService = {
  getProfile: async (username) => {
    try {
      const response = await API.get(`/doctor/profile/${username}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  getAssignedClients: async (doctorUsername) => {
    try {
      const response = await API.get(`/doctor/clients/${doctorUsername}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch assigned clients');
    }
  }
};

// Symptom Service
export const symptomService = {
  createSymptom: async (symptomData) => {
    try {
      const response = await API.post('/symptom', symptomData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create symptom');
    }
  },

  getSymptomsByClient: async (clientUsername) => {
    try {
      const response = await API.get(`/symptom/client/${clientUsername}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch symptoms');
    }
  },

  updateSymptom: async (symptomId, symptomData) => {
    try {
      const response = await API.put(`/symptom/${symptomId}`, symptomData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update symptom');
    }
  }
};

// Diagnosis Service
export const diagnosisService = {
  createDiagnosis: async (diagnosisData) => {
    try {
      const response = await API.post('/diagnosis', diagnosisData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create diagnosis');
    }
  },

  getDiagnosesByClient: async (clientUsername) => {
    try {
      const response = await API.get(`/diagnosis/client/${clientUsername}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch diagnoses');
    }
  },

  updateDiagnosis: async (diagnosisId, diagnosisData) => {
    try {
      const response = await API.put(`/diagnosis/${diagnosisId}`, diagnosisData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update diagnosis');
    }
  }
};

export default API;