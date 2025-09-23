import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/apiService';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      // Demo data - replace with actual API call
      const demoClients = [
        { id: 1, userName: 'john_doe', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '123-456-7890' },
        { id: 2, userName: 'jane_smith', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '123-456-7891' },
        { id: 3, userName: 'bob_wilson', firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com', phone: '123-456-7892' }
      ];
      setClients(demoClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Demo - add to local state
      const newClient = {
        id: clients.length + 1,
        ...formData
      };
      setClients([...clients, newClient]);
      setShowForm(false);
      setFormData({
        userName: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      });
      alert('Client created successfully!');
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error creating client');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        setClients(clients.filter(client => client.id !== id));
        alert('Client deleted successfully!');
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error deleting client');
      }
    }
  };

  if (loading) return <div>Loading clients...</div>;

  return (
    <div style={styles.management}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Client Management</h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          style={styles.primaryButton}
        >
          {showForm ? 'Cancel' : 'Add New Client'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.formTitle}>Add New Client</h3>
          <div style={styles.formGrid}>
            <input
              type="text"
              placeholder="Username"
              value={formData.userName}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.input}
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={styles.input}
            />
          </div>
          <div style={styles.formActions}>
            <button type="submit" style={styles.primaryButton}>Create Client</button>
          </div>
        </form>
      )}

      <div style={styles.list}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id} style={styles.tr}>
                <td style={styles.td}>{client.id}</td>
                <td style={styles.td}>{client.userName}</td>
                <td style={styles.td}>{client.firstName} {client.lastName}</td>
                <td style={styles.td}>{client.email}</td>
                <td style={styles.td}>{client.phone}</td>
                <td style={styles.td}>
                  <button style={styles.warningButton}>Edit</button>
                  <button 
                    onClick={() => handleDelete(client.id)}
                    style={styles.dangerButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  management: {
    padding: '1rem 0'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  sectionTitle: {
    margin: 0,
    color: '#333'
  },
  form: {
    background: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '1.5rem'
  },
  formTitle: {
    margin: '0 0 1rem 0',
    color: '#333'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  formActions: {
    display: 'flex',
    gap: '1rem'
  },
  list: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
    color: '#333'
  },
  tr: {
    borderBottom: '1px solid #ddd'
  },
  td: {
    padding: '1rem',
    textAlign: 'left'
  },
  primaryButton: {
    background: '#007bff',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  warningButton: {
    background: '#ffc107',
    color: 'black',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '0.5rem'
  },
  dangerButton: {
    background: '#dc3545',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default ClientManagement;