import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const DebugAuth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: '#333',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px',
      fontFamily: 'monospace'
    }}>
      <div><strong>Auth Debug Info:</strong></div>
      <div>Current Path: {location.pathname}</div>
      <div>User: {user ? user.userName : 'null'}</div>
      <div>Role: {user ? user.role : 'null'}</div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
      <button 
        onClick={() => {
          console.log('User:', user);
          console.log('Token:', localStorage.getItem('token'));
          console.log('Storage User:', localStorage.getItem('user'));
        }}
        style={{ marginTop: '5px', fontSize: '10px' }}
      >
        Log to Console
      </button>
    </div>
  );
};

export default DebugAuth;