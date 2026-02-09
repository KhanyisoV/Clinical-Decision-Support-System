import React, { useState, useEffect } from 'react';
import { adminService } from '../services/apiService';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    assignedDoctorId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [clientsResponse, doctorsResponse] = await Promise.all([
        adminService.getAllClients(),
        adminService.getAllDoctors()
      ]);

      if (clientsResponse.success) {
        setClients(clientsResponse.data);
      } else {
        throw new Error(clientsResponse.message);
      }

      if (doctorsResponse.success) {
        setDoctors(doctorsResponse.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        // Update existing client
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        
        await adminService.updateClient(editingClient.userName, updateData);
      } else {
        // Create new client
        await adminService.createClient(formData);
      }
      
      setShowModal(false);
      resetForm();
      await loadData(); // Reload data
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      userName: client.userName,
      password: '',
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      email: client.email || '',
      dateOfBirth: client.dateOfBirth ? client.dateOfBirth.split('T')[0] : '',
      assignedDoctorId: client.assignedDoctor?.userName || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (username) => {
    if (!window.confirm(`Are you sure you want to delete client "${username}"?`)) {
      return;
    }

    try {
      await adminService.deleteClient(username);
      await loadData(); // Reload data
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      userName: '',
      password: '',
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      assignedDoctorId: ''
    });
    setEditingClient(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return <div style={styles.loading}>Loading clients...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Client Management</h2>
        <button
          onClick={() => setShowModal(true)}
          style={styles.addButton}
        >
          + Add New Client
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          <p>{error}</p>
          <button onClick={loadData} style={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Date of Birth</th>
              <th>Assigned Doctor</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.userName}>
                <td>{client.userName}</td>
                <td>{`${client.firstName || ''} ${client.lastName || ''}`.trim()}</td>
                <td>{client.email || '-'}</td>
                <td>{client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : '-'}</td>
                <td>
                  {client.assignedDoctor 
                    ? `${client.assignedDoctor.firstName} ${client.assignedDoctor.lastName}` 
                    : 'Not assigned'
                  }
                </td>
                <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleEdit(client)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(client.userName)}
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

      {/* Modal for Add/Edit Client */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
              <button onClick={handleModalClose} style={styles.closeButton}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Username*</label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({...formData, userName: e.target.value})}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Password{!editingClient && '*'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingClient}
                  placeholder={editingClient ? 'Leave blank to keep current password' : ''}
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label>First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Assigned Doctor</label>
                <select
                  value={formData.assignedDoctorId}
                  onChange={(e) => setFormData({...formData, assignedDoctorId: e.target.value})}
                  style={styles.select}
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.userName} value={doctor.userName}>
                      {`${doctor.firstName} ${doctor.lastName} - ${doctor.specialization || 'General'}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={handleModalClose} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  {editingClient ? 'Update Client' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '1rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  addButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
    color: '#666'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
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
  noData: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666'
  },
  editButton: {
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '0.5rem'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
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
    overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer'
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
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  select: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem'
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  submitButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

// Add table styles
styles.table = {
  ...styles.table,
  'th': {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: '2px solid #dee2e6'
  },
  'td': {
    padding: '1rem',
    borderBottom: '1px solid #dee2e6'
  },
  'tr:hover': {
    backgroundColor: '#f8f9fa'
  }
};

export default ClientManagement;