import React from 'react';
import { useAuth } from '../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();

  return (
    <div style={styles.dashboard}>
      <h1>Doctor Dashboard</h1>
      <p>Welcome, Dr. {user?.firstName} {user?.lastName}</p>
      <div style={styles.features}>
        <div style={styles.featureCard}>
          <h3>My Patients</h3>
          <p>Manage your patient list</p>
        </div>
        <div style={styles.featureCard}>
          <h3>Appointments</h3>
          <p>View and schedule appointments</p>
        </div>
        <div style={styles.featureCard}>
          <h3>Medical Records</h3>
          <p>Access patient medical records</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboard: {
    padding: '2rem'
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginTop: '2rem'
  },
  featureCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
  }
};

export default DoctorDashboard;