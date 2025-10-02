import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <h1>Patient Dashboard</h1>
        <div style={styles.userInfo}>
          <span>Welcome, {user?.firstName} {user?.lastName}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
      
      <div style={styles.content}>
        <p>Welcome to your patient portal, {user?.firstName}!</p>
        <div style={styles.features}>
          <div style={styles.featureCard}>
            <h3>My Profile</h3>
            <p>View and update your personal information</p>
            <button style={styles.featureButton}>View Profile</button>
          </div>
          <div style={styles.featureCard}>
            <h3>My Symptoms</h3>
            <p>Track your symptoms and health status</p>
            <button style={styles.featureButton}>View Symptoms</button>
          </div>
          <div style={styles.featureCard}>
            <h3>My Diagnoses</h3>
            <p>View your medical diagnoses and treatment plans</p>
            <button style={styles.featureButton}>View Diagnoses</button>
          </div>
          <div style={styles.featureCard}>
            <h3>My Doctor</h3>
            <p>Contact information and communication</p>
            <button style={styles.featureButton}>Contact Doctor</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboard: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: 'white',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  content: {
    padding: '2rem'
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginTop: '2rem'
  },
  featureCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  featureButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  }
};

export default ClientDashboard;