import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.layout}>
      <nav style={styles.navbar}>
        <div style={styles.navbarBrand}>
          <h2 style={styles.title}>Medical System - {user?.role} Dashboard</h2>
        </div>
        <div style={styles.navbarMenu}>
          <span style={styles.welcome}>Welcome, {user?.userName}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  layout: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderBottom: '1px solid #ddd'
  },
  navbarBrand: {
    flex: 1
  },
  title: {
    margin: 0,
    color: '#333',
    fontSize: '1.5rem'
  },
  navbarMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  welcome: {
    color: '#666',
    fontSize: '0.9rem'
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  mainContent: {
    padding: '2rem',
    minHeight: 'calc(100vh - 80px)'
  }
};

export default Layout;