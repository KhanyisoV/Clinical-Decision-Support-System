import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/apiService';
import './LoginForm.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    userName: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('=== LOGIN ATTEMPT START ===');
      console.log('Form data:', { userName: formData.userName, password: '***' });
      
      // Call the auth service
      const response = await authService.login(formData);
      console.log('=== AUTH SERVICE RESPONSE ===');
      console.log('Response:', response);

      if (response.success) {
        // Update auth context
        login(response.data);
        
        console.log('=== LOGIN SUCCESS - NAVIGATING ===');
        console.log('User role:', response.data.role);
        
        // Navigate based on user role
        switch (response.data.role?.toLowerCase()) {
          case 'admin':
            console.log('Navigating to admin dashboard...');
            navigate('/admin/dashboard');
            break;
          case 'doctor':
            console.log('Navigating to doctor dashboard...');
            navigate('/doctor/dashboard');
            break;
          case 'client':
            console.log('Navigating to client dashboard...');
            navigate('/client/dashboard');
            break;
          default:
            console.log('Unknown role, navigating to default dashboard...');
            navigate('/dashboard');
            break;
        }
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login to Clinical Decision Support System</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? Contact your administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;