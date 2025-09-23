// Mock API service - replace with actual API calls
export const authService = {
  login: async (credentials) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo users for testing
    const demoUsers = {
      'admin': { 
        id: 1, 
        userName: 'admin', 
        role: 'Admin',
        token: 'demo-admin-token'
      },
      'doctor': { 
        id: 2, 
        userName: 'doctor', 
        role: 'Doctor',
        token: 'demo-doctor-token'
      },
      'client': { 
        id: 3, 
        userName: 'client', 
        role: 'Client',
        token: 'demo-client-token'
      }
    };

    if (demoUsers[credentials.userName] && credentials.password === 'password') {
      return {
        success: true,
        data: demoUsers[credentials.userName]
      };
    } else {
      throw new Error('Invalid credentials');
    }
  },

  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: { ...userData, id: Math.floor(Math.random() * 1000) }
    };
  }
};

// Mock data for demonstration
const mockClients = [
  { id: 1, userName: 'john_doe', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '123-456-7890' },
  { id: 2, userName: 'jane_smith', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '123-456-7891' },
  { id: 3, userName: 'bob_wilson', firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com', phone: '123-456-7892' }
];

const mockDoctors = [
  { id: 1, userName: 'dr_smith', firstName: 'Sarah', lastName: 'Smith', specialization: 'Cardiology' },
  { id: 2, userName: 'dr_johnson', firstName: 'Mike', lastName: 'Johnson', specialization: 'Neurology' }
];

export const adminService = {
  getAllClients: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: mockClients };
  },
  
  createClient: async (clientData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newClient = {
      id: mockClients.length + 1,
      ...clientData
    };
    mockClients.push(newClient);
    return { data: newClient };
  },
  
  updateClient: async (id, clientData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockClients.findIndex(client => client.id === id);
    if (index !== -1) {
      mockClients[index] = { ...mockClients[index], ...clientData };
    }
    return { data: mockClients[index] };
  },
  
  deleteClient: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockClients.findIndex(client => client.id === id);
    if (index !== -1) {
      mockClients.splice(index, 1);
    }
    return { success: true };
  },
  
  getAllDoctors: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: mockDoctors };
  },
  
  createDoctor: async (doctorData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newDoctor = {
      id: mockDoctors.length + 1,
      ...doctorData
    };
    mockDoctors.push(newDoctor);
    return { data: newDoctor };
  }
};

export const clientService = {
  getProfile: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const client = mockClients.find(c => c.id === id);
    return { data: client };
  }
};

export const doctorService = {
  getClientsByDoctor: async (doctorId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: mockClients };
  }
};