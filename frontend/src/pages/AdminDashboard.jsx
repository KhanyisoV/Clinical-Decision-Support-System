import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div style={styles.dashboard}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.firstName} {user?.lastName}</p>
      <div style={styles.features}>
        <div style={styles.featureCard}>
          <h3>Manage Users</h3>
          <p>View and manage all system users</p>
        </div>
        <div style={styles.featureCard}>
          <h3>System Settings</h3>
          <p>Configure system preferences</p>
        </div>
        <div style={styles.featureCard}>
          <h3>Reports</h3>
          <p>View system reports and analytics</p>
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

export default AdminDashboard;