// Updated AdminDashboard.jsx with fixes for client creation

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Messages from '../components/Messages';
import { adminService, messageService } from '../services/apiService';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
  recipientUsername: '',
  recipientRole: '',
  content: ''
});
const [allUsers, setAllUsers] = useState([]);

  // Data states
  const [appointments, setAppointments] = useState([]);
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
    if (activeTab === 'clients' && clients.length === 0) {
      loadClients();
    } else if (activeTab === 'doctors' && doctors.length === 0) {
      loadDoctors();
    } else if (activeTab === 'admins' && admins.length === 0) {
      loadAdmins();
    } else if (activeTab === 'appointments' && appointments.length === 0) {
      loadAppointments();
    }
  }, [activeTab]);

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


  useEffect(() => {
    if (selectedRecipient) {
      setMessageForm(prev => ({
        ...prev,
        recipientUsername: selectedRecipient.username,
        recipientRole: selectedRecipient.role
      }));
    }
  }, [selectedRecipient]);

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

  const loadAppointments = async () => {
    try {
      const response = await adminService.getAllAppointments();
      if (response.success) {
        setAppointments(response.data);
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
  const loadAllUsers = async () => {
    try {
      const [clientsRes, doctorsRes, adminsRes] = await Promise.all([
        adminService.getAllClients(),
        adminService.getAllDoctors(),
        adminService.getAllAdmins()
      ]);
  
      const users = [
        ...(clientsRes.success ? clientsRes.data.map(c => ({
          username: c.userName,
          name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.userName,
          role: 'Client'
        })) : []),
        ...(doctorsRes.success ? doctorsRes.data.map(d => ({
          username: d.userName,
          name: `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.userName,
          role: 'Doctor'
        })) : []),
        ...(adminsRes.success ? adminsRes.data.map(a => ({
          username: a.userName,
          name: `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.userName,
          role: 'Admin'
        })) : [])
      ];
  
      setAllUsers(users);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };
  
  const handleComposeMessage = () => {
    loadAllUsers();
    setShowComposeModal(true);
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageForm.recipientUsername || !messageForm.recipientRole || !messageForm.content) {
      setError('Please fill in all fields');
      return;
    }
  
    try {
      setError(null);
      const response = await messageService.sendMessage(
        messageForm.recipientUsername,
        messageForm.recipientRole,
        messageForm.content
      );
  
      if (response.success) {
        setSuccessMessage('Message sent successfully!');
        setShowComposeModal(false);
        setMessageForm({ recipientUsername: '', recipientRole: '', content: '' });
        setSelectedRecipient(null);
      } else {
        setError(response.message || 'Failed to send message');
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
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
    case 'messages':
      return renderMessagesTab();
    case 'doctors':
      return renderDoctorManagement();
    case 'admins':
      return renderAdminManagement();
    case 'appointments':
      return renderAppointmentManagement();
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

      <StatCard
        title="Total Appointments"
        value={stats?.totalAppointments}
        icon="📅"
        color="#007bff"
      />
      <StatCard
        title="Today's Appointments"
        value={stats?.todaysAppointments}
        icon="📆"
        color="#28a745"
      />
      <StatCard
        title="Upcoming Appointments"
        value={stats?.upcomingAppointments}
        icon="⏰"
        color="#17a2b8"
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

          <button
            onClick={() => setActiveTab('appointments')}
            style={{...styles.actionButton, backgroundColor: '#007bff'}}
          >
            View Appointments
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
                    onClick={() => {
                      setSelectedRecipient({
                        username: client.userName,
                        role: 'Client',
                        fullName: `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.userName
                      });
                      setActiveTab('messages');
                    }}
                    style={{...styles.editButton, backgroundColor: '#10b981', marginRight: '0.5rem'}}
                  >
                    Message
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
                  onClick={() => {
                    setSelectedRecipient({
                      username: doctor.userName,
                      role: 'Doctor',
                      fullName: `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || doctor.userName
                    });
                    setActiveTab('messages');
                  }}
                  style={{...styles.editButton, backgroundColor: '#10b981', marginRight: '0.5rem'}}
                >
                  Message
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

  const renderAppointmentManagement = () => {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Scheduled': return '#007bff';
      case 'Completed': return '#28a745';
      case 'Cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // HH:MM format
  };

  return (
    <div style={styles.managementContainer}>
      <div style={styles.managementHeader}>
        <h2>Appointment Management</h2>
        <button
          onClick={loadAppointments}
          style={{...styles.addButton, backgroundColor: '#007bff'}}
        >
          🔄 Refresh
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

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Doctor</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Location</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} style={styles.tableRow}>
                <td style={styles.td}>{formatDate(appointment.appointmentDate)}</td>
                <td style={styles.td}>
                  {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                </td>
                <td style={styles.td}>
                  <strong>{appointment.title}</strong>
                  {appointment.description && (
                    <div style={{fontSize: '0.85rem', color: '#666', marginTop: '0.25rem'}}>
                      {appointment.description}
                    </div>
                  )}
                </td>
                <td style={styles.td}>{appointment.clientName}</td>
                <td style={styles.td}>
                  {appointment.doctorName}
                  {appointment.doctorSpecialization && (
                    <div style={{fontSize: '0.85rem', color: '#666'}}>
                      {appointment.doctorSpecialization}
                    </div>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.roleBadge,
                    backgroundColor: getStatusBadgeColor(appointment.status)
                  }}>
                    {appointment.status}
                  </span>
                </td>
                <td style={styles.td}>{appointment.location || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && (
          <div style={styles.noData}>No appointments found</div>
        )}
      </div>
    </div>
  );
};
const renderMessagesTab = () => (
  <div style={styles.managementContainer}>
    <div style={styles.managementHeader}>
      <h2>Messages</h2>
      <button
        onClick={handleComposeMessage}
        style={{...styles.addButton, backgroundColor: '#10b981'}}
      >
        ✉️ Compose New Message
      </button>
    </div>

    {showComposeModal && (
      <div style={styles.modalOverlay}>
        <div style={styles.modal}>
          <div style={styles.modalHeader}>
            <h3>Compose Message</h3>
            <button 
              onClick={() => {
                setShowComposeModal(false);
                setMessageForm({ recipientUsername: '', recipientRole: '', content: '' });
                setSelectedRecipient(null);
              }}
              style={styles.closeButton}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSendMessage} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>To (Recipient)*</label>
              <select
                value={messageForm.recipientUsername}
                onChange={(e) => {
                  const selectedUser = allUsers.find(u => u.username === e.target.value);
                  setMessageForm({
                    ...messageForm, 
                    recipientUsername: e.target.value,
                    recipientRole: selectedUser?.role || ''
                  });
                }}
                required
                style={styles.select}
                disabled={!!selectedRecipient}
              >
                <option value="">Select a recipient</option>
                {allUsers.map((user) => (
                  <option key={user.username} value={user.username}>
                    {user.name} ({user.role}) - @{user.username}
                  </option>
                ))}
              </select>
              {selectedRecipient && (
                <small style={{color: '#666', fontSize: '0.85rem', marginTop: '0.25rem'}}>
                  Sending to: {selectedRecipient.fullName} ({selectedRecipient.role})
                </small>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Message*</label>
              <textarea
                value={messageForm.content}
                onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
                required
                placeholder="Type your message here..."
                rows={8}
                style={{...styles.input, resize: 'vertical', fontFamily: 'inherit'}}
              />
            </div>

            <div style={styles.formActions}>
              <button 
                type="button" 
                onClick={() => {
                  setShowComposeModal(false);
                  setMessageForm({ recipientUsername: '', recipientRole: '', content: '' });
                  setSelectedRecipient(null);
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button type="submit" style={{...styles.submitButton, backgroundColor: '#10b981'}}>
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    <Messages selectedRecipient={selectedRecipient} />
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

        <TabButton
          tabKey="appointments"
          label="Appointments"
          isActive={activeTab === 'appointments'}
          onClick={setActiveTab}
        />
        <TabButton
            tabKey="messages"
            label="Messages"
            isActive={activeTab === 'messages'}
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
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  },
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '0.25rem'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  role: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  tabContainer: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    padding: '0 2rem',
    gap: '1rem'
  },
  tabButton: {
    padding: '1rem 1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s'
  },
  activeTab: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6'
  },
  content: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
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
    backgroundColor: '#fef2f2',
    borderLeft: '4px solid #ef4444',
    color: '#991b1b',
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem'
  },
  retryButton: {
    marginLeft: 'auto',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    padding: '0.25rem',
    fontWeight: '600'
  },
  successMessage: {
    backgroundColor: '#f0fdf4',
    borderLeft: '4px solid #10b981',
    color: '#065f46',
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem'
  },
  dismissButton: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    padding: '0.25rem',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    backgroundColor: '#dbeafe',
    flexShrink: 0
  },
  statTitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.25rem',
    margin: 0
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
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
    padding: '0.625rem 1rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'white',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  managementContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  managementHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    backgroundColor: '#f9fafb'
  },
  th: {
    padding: '1rem 1.25rem',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: '1px solid #e5e7eb',
    color: '#6b7280',
    fontSize: '0.875rem'
  },
  tableRow: {
    transition: 'background-color 0.2s ease',
    borderBottom: '1px solid #f0f0f0'
  },
  td: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #f0f0f0',
    color: '#374151',
    fontSize: '0.875rem'
  },
  noData: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '0.875rem',
    padding: '2rem'
  },
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  roleBadge: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
    display: 'inline-block'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'all 0.2s',
    fontSize: '1.5rem'
  },
  form: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  input: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#111827',
    transition: 'all 0.2s',
    outline: 'none'
  },
  select: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#111827',
    backgroundColor: 'white',
    transition: 'all 0.2s',
    outline: 'none'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
    marginTop: '0.5rem'
  },
  cancelButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  }
};

export default AdminDashboard;