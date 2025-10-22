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
      console.log('Login response:', response.data); // Debug log
      
      // Handle the response structure from your backend
      if (response.data.success) {
        const responseData = response.data.data || response.data;
        
        // Store token and user data
        localStorage.setItem('token', responseData.token);
        localStorage.setItem('user', JSON.stringify({
          userName: responseData.userName,
          role: responseData.role,
          firstName: responseData.firstName,
          lastName: responseData.lastName
        }));
        
        return {
          success: true,
          data: {
            token: responseData.token,
            userName: responseData.userName,
            role: responseData.role,
            firstName: responseData.firstName,
            lastName: responseData.lastName
          }
        };
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] || 
                          error.message || 
                          'Login failed';
      throw new Error(errorMessage);
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
  },

  // Appointment Management (ADD THIS)
  getAllAppointments: async () => {
    try {
      const response = await API.get('/admin/appointments');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
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
      console.log('Fetching doctor profile for:', username);
      const response = await API.get(`/doctor/profile/${username}`);
      console.log('Doctor profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Doctor profile error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch profile');
    }
  },

  getAssignedClients: async (doctorUsername) => {
    try {
      console.log('Fetching assigned clients for doctor:', doctorUsername);
      const response = await API.get(`/doctor/clients/${doctorUsername}`);
      console.log('Assigned clients response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Assigned clients error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch assigned clients');
    }
  },

  updateProfile: async (username, profileData) => {
    try {
      const response = await API.put(`/doctor/profile/${username}`, profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to update profile');
    }
  }
};

// Symptom Service
export const symptomService = {
  createSymptom: async (symptomData) => {
    try {
      const response = await API.post('/symptoms/add-to-client', symptomData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create symptom');
    }
  },

  getSymptomsByClientUsername: async (clientUsername) => {
    try {
      const response = await API.get(`/symptoms/client/username/${clientUsername}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch symptoms');
    }
  },

  getSymptomsByClient: async (clientId) => {
    try {
      const response = await API.get(`/symptoms/client/${clientId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch symptoms');
    }
  },

  updateSymptom: async (symptomId, symptomData) => {
    try {
      const response = await API.put(`/symptoms/${symptomId}`, symptomData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update symptom');
    }
  },

  deleteSymptom: async (symptomId) => {
    try {
      const response = await API.delete(`/symptoms/${symptomId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete symptom');
    }
  }
};
// Diagnosis Service
export const diagnosisService = {
  createDiagnosis: async (diagnosisData) => {
    try {
      const response = await API.post('/diagnosis/add-to-client', diagnosisData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create diagnosis');
    }
  },

  getDiagnosesByClientUsername: async (clientUsername) => {
    try {
      const response = await API.get(`/diagnosis/client/username/${clientUsername}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch diagnoses');
    }
  },

  getDiagnosesByClient: async (clientId) => {
    try {
      const response = await API.get(`/diagnosis/client/${clientId}`);
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
  },

  deleteDiagnosis: async (diagnosisId) => {
    try {
      const response = await API.delete(`/diagnosis/${diagnosisId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete diagnosis');
    }
  }
};
// Appointment Service
export const appointmentService = {
  // Get all appointments
  getAllAppointments: async () => {
    try {
      const response = await API.get('/appointment');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch appointments');
    }
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId) => {
    try {
      const response = await API.get(`/appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch appointment');
    }
  },

  // Create new appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await API.post('/appointment', appointmentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to create appointment');
    }
  },

  // Update appointment
  updateAppointment: async (appointmentId, appointmentData) => {
    try {
      const response = await API.put(`/appointment/${appointmentId}`, appointmentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to update appointment');
    }
  },

  // Delete appointment
  deleteAppointment: async (appointmentId) => {
    try {
      const response = await API.delete(`/appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to delete appointment');
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId, cancellationReason) => {
    try {
      const response = await API.patch(`/appointment/${appointmentId}/cancel`, cancellationReason);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to cancel appointment');
    }
  },

  // Complete appointment
  completeAppointment: async (appointmentId) => {
    try {
      const response = await API.patch(`/appointment/${appointmentId}/complete`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to complete appointment');
    }
  }
};
// Allergy Service
export const allergyService = {
  // Get all allergies (filtered by role on backend)
  getAllAllergies: async () => {
    try {
      const response = await API.get('/allergy');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch allergies');
    }
  },

  // Get allergy by ID
  getAllergyById: async (allergyId) => {
    try {
      const response = await API.get(`/allergy/${allergyId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch allergy');
    }
  },

  // Get allergies by client ID
  getAllergiesByClientId: async (clientId) => {
    try {
      const response = await API.get(`/allergy/client/${clientId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch allergies');
    }
  },

  // Get active allergies by client ID
  getActiveAllergiesByClientId: async (clientId) => {
    try {
      const response = await API.get(`/allergy/client/${clientId}/active`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch active allergies');
    }
  },

  // Create new allergy (Doctor and Client only)
  createAllergy: async (allergyData) => {
    try {
      const response = await API.post('/allergy', allergyData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to create allergy');
    }
  },

  // Update allergy (Doctor and Client only)
  updateAllergy: async (allergyId, allergyData) => {
    try {
      const response = await API.put(`/allergy/${allergyId}`, allergyData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to update allergy');
    }
  },

  // Delete allergy (Doctor and Client only)
  deleteAllergy: async (allergyId) => {
    try {
      const response = await API.delete(`/allergy/${allergyId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to delete allergy');
    }
  }
};
// Prescription Service
export const prescriptionService = {
  // Get all prescriptions (filtered by role on backend)
  getAllPrescriptions: async () => {
    try {
      const response = await API.get('/prescription');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch prescriptions');
    }
  },

  // Get prescription by ID
  getPrescriptionById: async (prescriptionId) => {
    try {
      const response = await API.get(`/prescription/${prescriptionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch prescription');
    }
  },

  // Get active prescriptions by client ID
  getActivePrescriptionsByClientId: async (clientId) => {
    try {
      const response = await API.get(`/prescription/client/${clientId}/active`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch active prescriptions');
    }
  },

  // Create new prescription (Doctor only)
  createPrescription: async (prescriptionData) => {
    try {
      const response = await API.post('/prescription', prescriptionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to create prescription');
    }
  },

  // Update prescription (Doctor only)
  updatePrescription: async (prescriptionId, prescriptionData) => {
    try {
      const response = await API.put(`/prescription/${prescriptionId}`, prescriptionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to update prescription');
    }
  },

  // Delete prescription (Doctor only)
  deletePrescription: async (prescriptionId) => {
    try {
      const response = await API.delete(`/prescription/${prescriptionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to delete prescription');
    }
  }
};
export const labResultService = {
  // Get all lab results (filtered by role on backend)
  getAllLabResults: async () => {
    try {
      const response = await API.get('/labresult');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch lab results');
    }
  },

  // Get lab result by ID
  getLabResultById: async (labResultId) => {
    try {
      const response = await API.get(`/labresult/${labResultId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch lab result');
    }
  },

  // Get lab results by client ID
  getLabResultsByClientId: async (clientId) => {
    try {
      const response = await API.get(`/labresult/client/${clientId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch lab results');
    }
  },

  // Create new lab result
  createLabResult: async (labResultData) => {
    try {
      const response = await API.post('/labresult', labResultData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to create lab result');
    }
  },

  // Update lab result
  updateLabResult: async (labResultId, labResultData) => {
    try {
      const response = await API.put(`/labresult/${labResultId}`, labResultData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to update lab result');
    }
  },

  // Delete lab result
  deleteLabResult: async (labResultId) => {
    try {
      const response = await API.delete(`/labresult/${labResultId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to delete lab result');
    }
  }
};
// Clinical Observation Service
export const clinicalObservationService = {
  // Get all observations (Admin only on backend, but we'll call it anyway)
  getAllObservations: async () => {
    try {
      const response = await API.get('/clinicalobservation');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch observations');
    }
  },

  // Get observation by ID
  getObservationById: async (observationId) => {
    try {
      const response = await API.get(`/clinicalobservation/${observationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch observation');
    }
  },

  // Get observations by client ID
  getObservationsByClientId: async (clientId) => {
    try {
      const response = await API.get(`/clinicalobservation/client/${clientId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch client observations');
    }
  },

  // Get observations by doctor ID
  getObservationsByDoctorId: async (doctorId) => {
    try {
      const response = await API.get(`/clinicalobservation/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch doctor observations');
    }
  },

  // Get latest observation for client
  getLatestObservationByClientId: async (clientId) => {
    try {
      const response = await API.get(`/clinicalobservation/client/${clientId}/latest`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch latest observation');
    }
  },

  // Create new observation (Doctor only)
  createObservation: async (observationData) => {
    try {
      const response = await API.post('/clinicalobservation', observationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to create observation');
    }
  },

  // Update observation (Doctor only)
  updateObservation: async (observationId, observationData) => {
    try {
      const response = await API.put(`/clinicalobservation/${observationId}`, observationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to update observation');
    }
  },

  // Delete observation (Doctor only)
  deleteObservation: async (observationId) => {
    try {
      const response = await API.delete(`/clinicalobservation/${observationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to delete observation');
    }
  }
};
// Treatment Service
export const treatmentService = {
  // Get all treatments (filtered by role on backend)
  getAllTreatments: async () => {
    try {
      const response = await API.get('/treatment');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch treatments');
    }
  },

  // Get treatment by ID
  getTreatmentById: async (treatmentId) => {
    try {
      const response = await API.get(`/treatment/${treatmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch treatment');
    }
  },

  // Get active treatments by client ID
  getActiveTreatmentsByClientId: async (clientId) => {
    try {
      const response = await API.get(`/treatment/client/${clientId}/active`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch active treatments');
    }
  },

  // Get treatments by status
  getTreatmentsByStatus: async (status) => {
    try {
      const response = await API.get(`/treatment/status/${status}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to fetch treatments');
    }
  },

  // Create new treatment (Doctor only)
  createTreatment: async (treatmentData) => {
    try {
      const response = await API.post('/treatment', treatmentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to create treatment');
    }
  },

  // Update treatment (Doctor only)
  updateTreatment: async (treatmentId, treatmentData) => {
    try {
      const response = await API.put(`/treatment/${treatmentId}`, treatmentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to update treatment');
    }
  },

  // Delete treatment (Doctor only)
  deleteTreatment: async (treatmentId) => {
    try {
      const response = await API.delete(`/treatment/${treatmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.Message || 'Failed to delete treatment');
    }
  }
};
export default API;