// App.js - Corrected with proper component names

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ClientDashboard from './pages/ClientDashboard';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || !user.role) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Redirect component to handle dashboard routing based on user role
const DashboardRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  switch (user.role?.toLowerCase()) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'doctor':
      return <Navigate to="/doctor/dashboard" replace />;
    case 'client':
      return <Navigate to="/client/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            
            {/* Dashboard redirect route */}
            <Route path="/dashboard" element={<DashboardRedirect />} />
            
            {/* Protected Admin routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Doctor routes */}
            <Route 
              path="/doctor/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Client routes */}
            <Route 
              path="/client/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Unauthorized route */}
            <Route 
              path="/unauthorized" 
              element={
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <h1>Unauthorized</h1>
                  <p>You don't have permission to access this page.</p>
                  <button onClick={() => window.location.href = '/login'}>
                    Back to Login
                  </button>
                </div>
              } 
            />
            
            {/* Default route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;