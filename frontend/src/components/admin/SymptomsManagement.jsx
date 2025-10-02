import React, { useState } from 'react';

const SymptomsManagement = () => {
  const [symptoms] = useState([
    { id: 1, name: 'Headache', description: 'Persistent head pain', severity: 3, client: 'John Doe', date: '2024-01-15' },
    { id: 2, name: 'Fever', description: 'High body temperature', severity: 4, client: 'Jane Smith', date: '2024-01-16' },
    { id: 3, name: 'Cough', description: 'Dry cough', severity: 2, client: 'Bob Wilson', date: '2024-01-17' }
  ]);

  return (
    <div style={styles.management}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Symptoms Management</h2>
      </div>

      <div style={styles.list}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Symptom</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Severity</th>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {symptoms.map(symptom => (
              <tr key={symptom.id} style={styles.tr}>
                <td style={styles.td}>{symptom.id}</td>
                <td style={styles.td}>{symptom.name}</td>
                <td style={styles.td}>{symptom.description}</td>
                <td style={styles.td}>
                  <span style={getSeverityStyle(symptom.severity)}>
                    {symptom.severity}/5
                  </span>
                </td>
                <td style={styles.td}>{symptom.client}</td>
                <td style={styles.td}>{symptom.date}</td>
                <td style={styles.td}>
                  <button style={styles.warningButton}>Edit</button>
                  <button style={styles.dangerButton}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const getSeverityStyle = (severity) => {
  const colors = {
    1: '#28a745',
    2: '#ffc107',
    3: '#fd7e14',
    4: '#dc3545',
    5: '#6f42c1'
  };
  return {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    color: 'white',
    backgroundColor: colors[severity] || '#6c757d',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  };
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

export default SymptomsManagement;