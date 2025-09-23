import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ClientRegisterForm from './components/ClientRegisterForm';
import DoctorRegisterForm from './components/DoctorRegisterForm';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          user ? <Navigate to={`/${user.role.toLowerCase()}`} replace /> : <LoginForm />
        } 
      />
      
      <Route path="/register" element={<ClientRegisterForm />} />
      <Route path="/register-doctor" element={<DoctorRegisterForm />} />
      
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/doctor/*" 
        element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <Layout>
              <DoctorDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/client/*" 
        element={
          <ProtectedRoute allowedRoles={['Client']}>
            <Layout>
              <ClientDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/" 
        element={
          <Navigate to={user ? `/${user.role.toLowerCase()}` : '/login'} replace />
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;