import React, { useState } from 'react';

const DiagnosesManagement = () => {
  const [diagnoses] = useState([
    { id: 1, title: 'Migraine', code: 'G43', severity: 3, client: 'John Doe', doctor: 'Dr. Smith', date: '2024-01-15' },
    { id: 2, title: 'Influenza', code: 'J11', severity: 4, client: 'Jane Smith', doctor: 'Dr. Johnson', date: '2024-01-16' },
    { id: 3, title: 'Bronchitis', code: 'J20', severity: 2, client: 'Bob Wilson', doctor: 'Dr. Smith', date: '2024-01-17' }
  ]);

  return (
    <div style={styles.management}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Diagnoses Management</h2>
      </div>

      <div style={styles.list}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Diagnosis</th>
              <th style={styles.th}>Code</th>
              <th style={styles.th}>Severity</th>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Doctor</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {diagnoses.map(diagnosis => (
              <tr key={diagnosis.id} style={styles.tr}>
                <td style={styles.td}>{diagnosis.id}</td>
                <td style={styles.td}>{diagnosis.title}</td>
                <td style={styles.td}>{diagnosis.code}</td>
                <td style={styles.td}>
                  <span style={getSeverityStyle(diagnosis.severity)}>
                    {diagnosis.severity}/5
                  </span>
                </td>
                <td style={styles.td}>{diagnosis.client}</td>
                <td style={styles.td}>{diagnosis.doctor}</td>
                <td style={styles.td}>{diagnosis.date}</td>
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

export default DiagnosesManagement;