import React, { useState, useEffect } from 'react';
import { adminService } from '../services/apiService';

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    specialization: '',
    licenseNumber: ''
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getAllDoctors();
      
      if (response.success) {
        setDoctors(response.data);
      } else {
        throw new Error(response.message);
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
      if (editingDoctor) {
        // Update existing doctor
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        
        await adminService.updateDoctor(editingDoctor.userName, updateData);
      } else {
        // Create new doctor
        await adminService.createDoctor(formData);
      }
      
      setShowModal(false);
      resetForm();
      await loadDoctors();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      userName: doctor.userName,
      password: '',
      firstName: doctor.firstName || '',
      lastName: doctor.lastName || '',
      email: doctor.email || '',
      specialization: doctor.specialization || '',
      licenseNumber: doctor.licenseNumber || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (username) => {
    if (!window.confirm(`Are you sure you want to delete doctor "${username}"?`)) {
      return;
    }

    try {
      await adminService.deleteDoctor(username);
      await loadDoctors();
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
      specialization: '',
      licenseNumber: ''
    });
    setEditingDoctor(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return <div style={styles.loading}>Loading doctors...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Doctor Management</h2>
        <button
          onClick={() => setShowModal(true)}
          style={styles.addButton}
        >
          + Add New Doctor
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          <p>{error}</p>
          <button onClick={loadDoctors} style={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Specialization</th>
              <th>License Number</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.userName} style={styles.tableRow}>
                <td style={styles.tableCell}>{doctor.userName}</td>
                <td style={styles.tableCell}>
                  {`${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()}
                </td>
                <td style={styles.tableCell}>{doctor.email || '-'}</td>
                <td style={styles.tableCell}>{doctor.specialization || '-'}</td>
                <td style={styles.tableCell}>{doctor.licenseNumber || '-'}</td>
                <td style={styles.tableCell}>
                  {new Date(doctor.createdAt).toLocaleDateString()}
                </td>
                <td style={styles.tableCell}>
                  <button
                    onClick={() => handleEdit(doctor)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doctor.userName)}
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

      {/* Modal for Add/Edit Doctor */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h3>
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
                <label>Password{!editingDoctor && '*'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingDoctor}
                  placeholder={editingDoctor ? 'Leave blank to keep current password' : ''}
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
                <label>Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  placeholder="e.g., Cardiology, Neurology, General Medicine"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>License Number</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={handleModalClose} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  {editingDoctor ? 'Update Doctor' : 'Create Doctor'}
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
    backgroundColor: '#17a2b8',
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
  tableHeader: {
    backgroundColor: '#f8f9fa'
  },
  tableRow: {
    '&:hover': {
      backgroundColor: '#f8f9fa'
    }
  },
  tableCell: {
    padding: '1rem',
    borderBottom: '1px solid #dee2e6'
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
    cursor: 'pointer',
    color: '#666'
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

export default DoctorManagement;