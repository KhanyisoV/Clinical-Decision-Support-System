// Updated AdminDashboard.jsx with fixes for client creation

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/apiService';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Data states
  const [clients, setClients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const getEmptyFormData = (type) => {
    const base = {
      userName: '',
      password: '',
      firstName: '',
      lastName: '',
      email: ''
    };

    if (type === 'client') {
      return { ...base, dateOfBirth: '', assignedDoctorId: '' };
    } else if (type === 'doctor') {
      return { ...base, specialization: '', licenseNumber: '' };
    }
    return base;
  };

  const getFormDataFromItem = (type, item) => {
    const base = {
      userName: item.userName,
      password: '',
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      email: item.email || ''
    };

    if (type === 'client') {
      return {
        ...base,
        dateOfBirth: item.dateOfBirth ? item.dateOfBirth.split('T')[0] : '',
        assignedDoctorId: item.assignedDoctorId || ''
      };
    } else if (type === 'doctor') {
      return {
        ...base,
        specialization: item.specialization || '',
        licenseNumber: item.licenseNumber || ''
      };
    }
    return base;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    console.log('🚀 useEffect running - loading dashboard stats');
    loadDashboardStats();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (activeTab === 'clients' && clients.length === 0) {
      loadClients();
    } else if (activeTab === 'doctors' && doctors.length === 0) {
      loadDoctors();
    } else if (activeTab === 'admins' && admins.length === 0) {
      loadAdmins();
    }
  }, [activeTab]);

  // const loadDashboardStats = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const response = await adminService.getDashboardStats();
  //     if (response.success) {
  //       setStats(response.data);
  //     } else {
  //       setError(response.message);
  //     }
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching dashboard stats...');
      const response = await adminService.getDashboardStats();
      console.log('✅ Response received:', response);
      console.log('📊 Response data:', response.data);
      
      if (response.success) {
        console.log('Setting stats to:', response.data);
        setStats(response.data);
        
        // Log stats after setting
        setTimeout(() => {
          console.log('Stats state after update:', stats);
        }, 100);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const [clientsResponse, doctorsResponse] = await Promise.all([
        adminService.getAllClients(),
        adminService.getAllDoctors()
      ]);
      if (clientsResponse.success) {
        const clientsWithDoctorIds = clientsResponse.data.map(client => ({
          ...client,
          assignedDoctorId: client.assignedDoctor?.id || null
        }));
        setClients(clientsWithDoctorIds);
      }
      if (doctorsResponse.success) setDoctors(doctorsResponse.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await adminService.getAllDoctors();
      if (response.success) {
        setDoctors(response.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await adminService.getAllAdmins();
      if (response.success) {
        setAdmins(response.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = (type) => {
    setModalType(type);
    setEditingItem(null);
    setFormData(getEmptyFormData(type));
    setShowModal(true);
  };

  const handleEdit = (type, item) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(getFormDataFromItem(type, item));
    setShowModal(true);
  };

  const handleDelete = async (type, username) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      setError(null);
      
      if (type === 'client') {
        await adminService.deleteClient(username);
        setSuccessMessage('Client deleted successfully!');
        loadClients();
      } else if (type === 'doctor') {
        await adminService.deleteDoctor(username);
        setSuccessMessage('Doctor deleted successfully!');
        loadDoctors();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (modalType === 'client') {
        const clientData = {
          ...formData,
          assignedDoctorId: formData.assignedDoctorId 
            ? parseInt(formData.assignedDoctorId, 10) 
            : null
        };
        
        if (editingItem) {
          const updateData = { ...clientData };
          if (!updateData.password) delete updateData.password;
          await adminService.updateClient(editingItem.userName, updateData);
          setSuccessMessage('Client updated successfully!');
        } else {
          await adminService.createClient(clientData);
          setSuccessMessage('Client created successfully!');
        }
        loadClients();
      } else if (modalType === 'doctor') {
        if (editingItem) {
          const updateData = { ...formData };
          if (!updateData.password) delete updateData.password;
          await adminService.updateDoctor(editingItem.userName, updateData);
          setSuccessMessage('Doctor updated successfully!');
        } else {
          await adminService.createDoctor(formData);
          setSuccessMessage('Doctor created successfully!');
        }
        loadDoctors();
      } else if (modalType === 'admin') {
        await adminService.createAdmin(formData);
        setSuccessMessage('Admin created successfully!');
        loadAdmins();
        setTimeout(() => {
          setActiveTab('dashboard');
          loadDashboardStats();
        }, 1500);
      }
      
      setShowModal(false);
      setFormData({});
      setEditingItem(null);
      
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  const TabButton = ({ tabKey, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(tabKey)}
      style={{
        ...styles.tabButton,
        ...(isActive ? styles.activeTab : {})
      }}
    >
      {label}
    </button>
  );

  const StatCard = ({ title, value, icon, color = '#007bff' }) => {
    const displayValue = loading ? '...' : (value ?? 0);
    console.log(`📊 StatCard - ${title}: value=${value}, display=${displayValue}`);
    
    return (
      <div style={{...styles.statCard, borderLeft: `4px solid ${color}`}}>
        <div style={styles.statHeader}>
          <span style={styles.statIcon}>{icon}</span>
          <h3 style={styles.statTitle}>{title}</h3>
        </div>
        <div style={styles.statValue}>
          {displayValue}
        </div>
      </div>
    );
  };
  const renderContent = () => {
    switch (activeTab) {
      case 'clients':
        return renderClientManagement();
      case 'doctors':
        return renderDoctorManagement();
      case 'admins':
        return renderAdminManagement();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div style={styles.dashboardContent}>
      <div style={styles.welcomeSection}>
        <h2>Welcome back, {user?.firstName || user?.userName}!</h2>
        <p>Here's an overview of your system</p>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={() => setError(null)} style={styles.retryButton}>
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div style={styles.successMessage}>
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} style={styles.dismissButton}>
            ×
          </button>
        </div>
      )}

      <div style={styles.statsGrid}>
      <StatCard
        title="Total Clients"
        value={stats?.totalClients}
        icon="👥"
        color="#28a745"
      />
      <StatCard
        title="Total Doctors"
        value={stats?.totalDoctors}
        icon="👨‍⚕️"
        color="#17a2b8"
      />
      <StatCard
        title="Total Admins"
        value={stats?.totalAdmins}
        icon="👔"
        color="#ffc107"
      />
      <StatCard
        title="Active Diagnoses"
        value={stats?.activeDiagnoses}
        icon="📋"
        color="#dc3545"
      />
      <StatCard
        title="Recent Registrations"
        value={stats?.recentRegistrations}
        icon="🆕"
        color="#6f42c1"
      />
      </div>

      <div style={styles.quickActions}>
        <h3>Quick Actions</h3>
        <div style={styles.actionButtons}>
          <button
            onClick={() => setActiveTab('clients')}
            style={{...styles.actionButton, backgroundColor: '#28a745'}}
          >
            Manage Clients
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            style={{...styles.actionButton, backgroundColor: '#17a2b8'}}
          >
            Manage Doctors
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            style={{...styles.actionButton, backgroundColor: '#ffc107', color: '#000'}}
          >
            Manage Admins
          </button>
          <button
            onClick={loadDashboardStats}
            style={{...styles.actionButton, backgroundColor: '#6c757d'}}
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderClientManagement = () => (
    <div style={styles.managementContainer}>
      <div style={styles.managementHeader}>
        <h2>Client Management</h2>
        <button
          onClick={() => handleCreate('client')}
          style={{...styles.addButton, backgroundColor: '#28a745'}}
        >
          + Add New Client
        </button>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={() => setError(null)} style={styles.retryButton}>
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div style={styles.successMessage}>
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} style={styles.dismissButton}>
            ×
          </button>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Date of Birth</th>
              <th style={styles.th}>Assigned Doctor</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.userName} style={styles.tableRow}>
                <td style={styles.td}>{client.userName}</td>
                <td style={styles.td}>{`${client.firstName || ''} ${client.lastName || ''}`.trim() || '-'}</td>
                <td style={styles.td}>{client.email || '-'}</td>
                <td style={styles.td}>
                  {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : '-'}
                </td>
                <td style={styles.td}>
                  {client.assignedDoctor 
                    ? `${client.assignedDoctor.firstName || ''} ${client.assignedDoctor.lastName || ''}`.trim()
                    : 'Not assigned'
                  }
                </td>
                <td style={styles.td}>{new Date(client.createdAt).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleEdit('client', client)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete('client', client.userName)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div style={styles.noData}>No clients found</div>
        )}
      </div>
    </div>
  );

  const renderDoctorManagement = () => (
    <div style={styles.managementContainer}>
      <div style={styles.managementHeader}>
        <h2>Doctor Management</h2>
        <button
          onClick={() => handleCreate('doctor')}
          style={{...styles.addButton, backgroundColor: '#17a2b8'}}
        >
          + Add New Doctor
        </button>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={() => setError(null)} style={styles.retryButton}>
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div style={styles.successMessage}>
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} style={styles.dismissButton}>
            ×
          </button>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Specialization</th>
              <th style={styles.th}>License Number</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.userName} style={styles.tableRow}>
                <td style={styles.td}>{doctor.userName}</td>
                <td style={styles.td}>
                  {`${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || '-'}
                </td>
                <td style={styles.td}>{doctor.email || '-'}</td>
                <td style={styles.td}>{doctor.specialization || '-'}</td>
                <td style={styles.td}>{doctor.licenseNumber || '-'}</td>
                <td style={styles.td}>{new Date(doctor.createdAt).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleEdit('doctor', doctor)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete('doctor', doctor.userName)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {doctors.length === 0 && (
          <div style={styles.noData}>No doctors found</div>
        )}
      </div>
    </div>
  );

  const renderAdminManagement = () => (
    <div style={styles.managementContainer}>
      <div style={styles.managementHeader}>
        <h2>Admin Management</h2>
        <button
          onClick={() => handleCreate('admin')}
          style={{...styles.addButton, backgroundColor: '#ffc107', color: '#000'}}
        >
          + Add New Admin
        </button>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={() => setError(null)} style={styles.retryButton}>
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div style={styles.successMessage}>
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} style={styles.dismissButton}>
            ×
          </button>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.userName} style={styles.tableRow}>
                <td style={styles.td}>{admin.userName}</td>
                <td style={styles.td}>
                  {`${admin.firstName || ''} ${admin.lastName || ''}`.trim() || '-'}
                </td>
                <td style={styles.td}>{admin.email || '-'}</td>
                <td style={styles.td}>
                  <span style={styles.roleBadge}>{admin.role}</span>
                </td>
                <td style={styles.td}>{new Date(admin.createdAt).toLocaleDateString()}</td>
                <td style={styles.td}>
                  {admin.updatedAt 
                    ? new Date(admin.updatedAt).toLocaleDateString() 
                    : '-'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {admins.length === 0 && (
          <div style={styles.noData}>No admins found</div>
        )}
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    const isEditing = editingItem !== null;
    const title = `${isEditing ? 'Edit' : 'Add'} ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`;

    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modal}>
          <div style={styles.modalHeader}>
            <h3>{title}</h3>
            <button 
              onClick={() => setShowModal(false)} 
              style={styles.closeButton}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username*</label>
              <input
                type="text"
                value={formData.userName || ''}
                onChange={(e) => setFormData({...formData, userName: e.target.value})}
                required
                disabled={isEditing}
                style={{...styles.input, opacity: isEditing ? 0.6 : 1}}
                placeholder="Enter username"
              />
              {isEditing && (
                <small style={{color: '#666', fontSize: '0.85rem'}}>
                  Username cannot be changed
                </small>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password{!isEditing && '*'}</label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!isEditing}
                minLength={6}
                placeholder={isEditing ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
                style={styles.input}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name</label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  style={styles.input}
                  placeholder="Enter first name"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  style={styles.input}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={styles.input}
                placeholder="Enter email address"
              />
            </div>

            {modalType === 'client' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Assigned Doctor</label>
                  <select
                    value={formData.assignedDoctorId || ''}
                    onChange={(e) => setFormData({...formData, assignedDoctorId: e.target.value})}
                    style={styles.select}
                  >
                    <option value="">Select a doctor (optional)</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {`${doctor.firstName} ${doctor.lastName} - ${doctor.specialization || 'General'}`}
                      </option>
                    ))}
                  </select>
                  <small style={{color: '#666', fontSize: '0.85rem', marginTop: '0.25rem'}}>
                    You can assign a doctor now or later
                  </small>
                </div>
              </>
            )}

            {modalType === 'doctor' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization || ''}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    placeholder="e.g., Cardiology, Neurology, General Medicine"
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>License Number</label>
                  <input
                    type="text"
                    value={formData.licenseNumber || ''}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    style={styles.input}
                    placeholder="Enter medical license number"
                  />
                </div>
              </>
            )}

            <div style={styles.formActions}>
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button type="submit" style={styles.submitButton}>
                {isEditing ? 'Update' : 'Create'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <div style={styles.userInfo}>
          <span>Welcome, {user?.firstName || user?.userName}</span>
          <span style={styles.role}>({user?.role})</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.tabContainer}>
        <TabButton
          tabKey="dashboard"
          label="Dashboard"
          isActive={activeTab === 'dashboard'}
          onClick={setActiveTab}
        />
        <TabButton
          tabKey="clients"
          label="Clients"
          isActive={activeTab === 'clients'}
          onClick={setActiveTab}
        />
        <TabButton
          tabKey="doctors"
          label="Doctors"
          isActive={activeTab === 'doctors'}
          onClick={setActiveTab}
        />
        <TabButton
          tabKey="admins"
          label="Admins"
          isActive={activeTab === 'admins'}
          onClick={setActiveTab}
        />
      </div>

      <div style={styles.content}>
        {renderContent()}
      </div>

      {renderModal()}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  title: {
    margin: 0,
    color: '#333',
    fontSize: '2rem'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.1rem'
  },
  role: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '15px',
    fontSize: '0.9rem'
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    marginLeft: '1rem'
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '0.5rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    gap: '0.5rem'
  },
  tabButton: {
    background: 'none',
    border: 'none',
    padding: '1rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.2s ease'
  },
  activeTab: {
    backgroundColor: '#007bff',
    color: 'white'
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    minHeight: '500px'
  },
  dashboardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  welcomeSection: {
    textAlign: 'center',
    marginBottom: '1rem'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '1rem',
    borderRadius: '6px',
    border: '1px solid #f5c6cb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  retryButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '1rem',
    borderRadius: '6px',
    border: '1px solid #c3e6cb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  dismissButton: {
    backgroundColor: 'transparent',
    color: '#155724',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    fontWeight: 'bold'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease'
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem'
  },
  statIcon: {
    fontSize: '1.5rem'
  },
  statTitle: {
    margin: 0,
    fontSize: '1rem',
    color: '#666',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  quickActions: {
    textAlign: 'center'
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    marginTop: '1rem'
  },
  actionButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    color: 'white',
    transition: 'opacity 0.2s ease'
  },
  managementContainer: {
    padding: '1rem'
  },
  managementHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  addButton: {
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    backgroundColor: '#f8f9fa'
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: '2px solid #dee2e6',
    color: '#495057'
  },
  tableRow: {
    transition: 'background-color 0.2s ease'
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #dee2e6'
  },
  noData: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
    fontSize: '1.1rem'
  },
  editButton: {
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '0.5rem',
    fontSize: '0.9rem'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  roleBadge: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '15px',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #dee2e6'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#666',
    padding: '0.25rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  formRow: {
    display: 'flex',
    gap: '1rem'
  },
  label: {
    fontWeight: '500',
    color: '#495057',
    marginBottom: '0.25rem'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    transition: 'border-color 0.2s ease'
  },
  select: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    backgroundColor: 'white'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #dee2e6'
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  submitButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  }
};

export default AdminDashboard;