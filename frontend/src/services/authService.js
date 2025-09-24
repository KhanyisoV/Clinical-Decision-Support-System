// Replace your authService in apiService.js with this version that matches your backend

export const authService = {
  login: async (credentials) => {
    console.log('=== AUTH SERVICE LOGIN START ===');
    console.log('Credentials:', { userName: credentials.userName, password: '***' });
    
    try {
      console.log('Making request to: http://localhost:5011/api/auth/login');
      
      const response = await API.post('/auth/login', credentials);
      
      console.log('=== RESPONSE RECEIVED ===');
      console.log('Status:', response.status);
      console.log('Response data:', response.data);
      
      // Your backend returns: { Success: true, Data: { Token: "...", Role: "...", UserName: "..." }, Message: "..." }
      const apiData = response.data;
      
      if (response.status === 200 && apiData.Success && apiData.Data) {
        console.log('=== LOGIN SUCCESS ===');
        console.log('Token received:', !!apiData.Data.Token);
        console.log('User:', apiData.Data.UserName);
        console.log('Role:', apiData.Data.Role);
        
        // Store in localStorage
        localStorage.setItem('token', apiData.Data.Token);
        localStorage.setItem('user', JSON.stringify({
          userName: apiData.Data.UserName,
          role: apiData.Data.Role,
          firstName: apiData.Data.UserName, // You don't have firstName in response, use userName
          lastName: ''
        }));
        
        return {
          success: true,
          data: {
            token: apiData.Data.Token,
            userName: apiData.Data.UserName,
            role: apiData.Data.Role,
            firstName: apiData.Data.UserName,
            lastName: ''
          }
        };
        
      } else if (response.status === 401 || (apiData.Success === false)) {
        console.log('=== LOGIN FAILED - UNAUTHORIZED ===');
        throw new Error(apiData.Message || 'Invalid username or password');
        
      } else {
        console.log('=== UNEXPECTED RESPONSE FORMAT ===');
        console.log('Full response:', JSON.stringify(apiData, null, 2));
        throw new Error('Unexpected response format from server');
      }
      
    } catch (error) {
      console.log('=== ERROR CAUGHT ===');
      console.log('Error type:', error.constructor.name);
      console.log('Error message:', error.message);
      
      if (error.response) {
        console.log('=== HTTP ERROR DETAILS ===');
        console.log('Status:', error.response.status);
        console.log('Response data:', error.response.data);
        
        // Handle different HTTP error responses
        if (error.response.status === 401) {
          throw new Error('Invalid username or password');
        } else if (error.response.status === 400) {
          const errorData = error.response.data;
          if (errorData.Errors && errorData.Errors.length > 0) {
            throw new Error(errorData.Errors.join(', '));
          } else {
            throw new Error(errorData.Message || 'Bad request');
          }
        } else if (error.response.status === 500) {
          const errorData = error.response.data;
          throw new Error(errorData.Message || 'Server error occurred');
        } else {
          throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
        }
      } else if (error.request) {
        console.log('=== NETWORK ERROR ===');
        console.log('No response received from server');
        throw new Error('Cannot connect to server. Please check if the backend is running on localhost:5011');
      } else {
        console.log('=== UNKNOWN ERROR ===');
        throw new Error(error.message || 'Unknown error occurred during login');
      }
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
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};