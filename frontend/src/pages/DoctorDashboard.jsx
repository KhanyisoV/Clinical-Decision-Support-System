import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <h1>Doctor Dashboard</h1>
        <div style={styles.userInfo}>
          <span>Welcome, Dr. {user?.firstName} {user?.lastName}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
      
      <div style={styles.content}>
        <p>Welcome to your dashboard, {user?.firstName}!</p>
        <div style={styles.features}>
          <div style={styles.featureCard}>
            <h3>My Patients</h3>
            <p>Manage your patient list</p>
            <button style={styles.featureButton}>View Patients</button>
          </div>
          <div style={styles.featureCard}>
            <h3>Appointments</h3>
            <p>View and schedule appointments</p>
            <button style={styles.featureButton}>Manage Appointments</button>
          </div>
          <div style={styles.featureCard}>
            <h3>Medical Records</h3>
            <p>Access patient medical records</p>
            <button style={styles.featureButton}>View Records</button>
          </div>
          <div style={styles.featureCard}>
            <h3>Diagnoses</h3>
            <p>Create and manage diagnoses</p>
            <button style={styles.featureButton}>Manage Diagnoses</button>
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
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  }
};

export default DoctorDashboard;