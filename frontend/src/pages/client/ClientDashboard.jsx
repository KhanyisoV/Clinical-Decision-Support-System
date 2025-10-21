import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaTemperatureHigh, FaLungs, FaTint, FaUserMd } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // fixed import

const dummyAppointments = [
  {
    id: 1,
    doctorName: 'Dr. Emily Smith',
    specialization: 'Oncologist',
    date: '2025-10-21',
  },
  {
    id: 2,
    doctorName: 'Dr. Michael Johnson',
    specialization: 'Cardiologist',
    date: '2025-10-25',
  },
];

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState([]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found.');
          return;
        }

        // Decode token to get client username
        const decoded = jwtDecode(token);
        console.log('Decoded token: ', decoded);

        // Use the correct claim for username
        const clientUsername = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        if (!clientUsername) {
          console.error('Client username not found in token.');
          return;
        }

        console.log('Fetching symptoms for client username:', clientUsername);

        // Update endpoint to match Swagger
        const response = await axios.get(
          `http://localhost:5011/api/Symptoms/client/username/${clientUsername}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        console.log('Fetched symptoms:', response.data);

        // Swagger response has "data" property
        if (response.data?.data && Array.isArray(response.data.data)) {
          setSymptoms(response.data.data);
        } else {
          console.warn('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching symptoms:', error.response || error.message);
      }
    };

    fetchSymptoms();
  }, []);


  return (
  <div style={styles.container}>
    {/* HEADER */}
    <header style={styles.header}>
      <div style={styles.logoSection}>
        <img src="/Ithemba logo.png" alt="Logo" style={styles.logo} />
        <nav style={styles.nav}>
          <button style={{ ...styles.navButton, ...styles.activeNav }}>Dashboard</button>
          <button style={styles.navButton}>Statistics</button>
          <button style={styles.navButton}>Profile</button>
        </nav>
      </div>
      <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
    </header>

    {/* MAIN CONTENT */}
    <main style={styles.main}>
      <h2 style={styles.greeting}>
    Hello, {user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : jwtDecode(localStorage.getItem('token'))?.sub}!
  </h2>
  <p style={styles.subGreeting}>Welcome to your Patient Dashboard</p>

      {/* HEALTH CARDS */}
      <section style={styles.healthSummary}>
        {/* Heart Rate */}
        <div style={styles.healthCard}>
          <div style={styles.healthTop}>
            <h4 style={styles.healthTitle}>Heart Rate</h4>
            <FaHeartbeat size={18} color="#7b6cf6" />
          </div>
          <div style={styles.healthChart}></div>
          <div style={styles.healthBottom}>
            <p style={styles.healthValue}>120</p>
            <span style={styles.healthUnit}>BPM</span>
          </div>
          <p style={styles.normalRange}>Normal: 60–100 BPM</p>
        </div>

        {/* Temperature */}
        <div style={styles.healthCard}>
          <div style={styles.healthTop}>
            <h4 style={styles.healthTitle}>Temperature</h4>
            <FaTemperatureHigh size={18} color="#ff7f50" />
          </div>
          <div style={styles.healthChartOrange}></div>
          <div style={styles.healthBottom}>
            <p style={styles.healthValue}>36.8</p>
            <span style={styles.healthUnit}>°C</span>
          </div>
          <p style={styles.normalRange}>Normal: 36.1–37.2 °C</p>
        </div>

        {/* Respiratory Rate */}
        <div style={styles.healthCard}>
          <div style={styles.healthTop}>
            <h4 style={styles.healthTitle}>Respiratory Rate</h4>
            <FaLungs size={18} color="#4dabf7" />
          </div>
          <div style={styles.healthChartBlue}></div>
          <div style={styles.healthBottom}>
            <p style={styles.healthValue}>18</p>
            <span style={styles.healthUnit}>bpm</span>
          </div>
          <p style={styles.normalRange}>Normal: 12–20 bpm</p>
        </div>

        {/* Water */}
        <div style={styles.healthCard}>
          <div style={styles.healthTop}>
            <h4 style={styles.healthTitle}>Water</h4>
            <FaTint size={18} color="#3cb7ff" />
          </div>
          <div style={styles.waterBarOuter}>
            <div style={styles.waterBarInner}></div>
          </div>
          <div style={styles.healthBottom}>
            <p style={styles.healthValue}>89%</p>
            <span style={styles.healthUnit}>1.7/2 litres</span>
          </div>
          <p style={styles.normalRange}>Normal: 1.5–2 litres/day</p>
        </div>

        {/* Oxygen Saturation */}
        <div style={styles.healthCard}>
          <div style={styles.healthTop}>
            <h4 style={styles.healthTitle}>Oxygen Saturation</h4>
            <FaTint size={18} color="#76c7c0" />
          </div>
          <div style={styles.healthChartBlue}></div>
          <div style={styles.healthBottom}>
            <p style={styles.healthValue}>97%</p>
            <span style={styles.healthUnit}>SpO₂</span>
          </div>
          <p style={styles.normalRange}>Normal: 95–100%</p>
        </div>
      </section>

      <button style={styles.viewAllBtn}>View All</button>

      {/* APPOINTMENTS + SYMPTOMS + ACTIONS */}
      <section style={styles.appointmentsSection}>
        <div style={styles.topRow}>
          {/* Latest Appointments */}
          <div style={styles.appointmentsLeft}>
            <h3 style={styles.sectionTitle}>Latest Appointments</h3>
            <div style={styles.appointmentsContainer}>
              <div style={styles.appointmentList}>
                {dummyAppointments.map((appt) => (
                  <div key={appt.id} style={styles.appointmentCard}>
                    <FaUserMd
                      size={40}
                      color="#4b6158"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '5px',
                        marginRight: '0.75rem',
                      }}
                    />
                    <div style={styles.appointmentDetails}>
                      <h4 style={styles.doctorName}>{appt.doctorName}</h4>
                      <p style={styles.specialization}>{appt.specialization}</p>
                      <p style={styles.date}>{appt.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ Symptoms Identified (Fixed, safe & dynamic) */}
          <div style={styles.symptomsSection}>
            <h3 style={styles.sectionTitle}>Symptoms Identified</h3>
            <div style={styles.symptomListContainer}>
              {symptoms && symptoms.length > 0 ? (
                <ul style={styles.symptomList}>
                  {symptoms.map((s) => (
                    <li key={s.id || s.Id} style={styles.symptomItem}>
                      <strong>{s.name || s.Name || 'Unnamed Symptom'}</strong>
                      {s.description || s.Description ? (
                        <span> – {s.description || s.Description}</span>
                      ) : null}

                      {s.addedByDoctor || s.AddedByDoctor ? (
                        <div>
                          <em>
                            Added by Dr.{' '}
                            {(s.addedByDoctor?.firstName || s.AddedByDoctor?.FirstName) ?? ''}{' '}
                            {(s.addedByDoctor?.lastName || s.AddedByDoctor?.LastName) ?? ''}
                          </em>
                        </div>
                      ) : null}

                      {s.notes || s.Notes ? (
                        <div>Notes: {s.notes || s.Notes}</div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: '0.5rem 0', color: '#555' }}>
                  No symptoms found for your account.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row - Appointment Requests */}
        <div style={styles.appointmentActionsFull}>
          <h3 style={styles.sectionTitle}>Appointment Requests</h3>
          {dummyAppointments.map((appt) => (
            <div key={appt.id} style={styles.appointmentRequestCard}>
              <p>
                <strong>{appt.doctorName}</strong> - {appt.date}
              </p>
              <div style={styles.actionsBtnGroup}>
                <button style={styles.acceptBtn}>Accept</button>
                <button style={styles.declineBtn}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  </div>
);
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f7f9fc',
    fontFamily: 'Segoe UI, sans-serif',
    color: '#2b2b2b',
    overflowX: 'hidden',
  },

  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '70px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 2rem',
    boxSizing: 'border-box',
    zIndex: 1000,
  },

  logoSection: { display: 'flex', alignItems: 'center', gap: '2rem' },
  logo: { width: '44px', height: '48px' },
  nav: { display: 'flex', gap: '1rem' },
  navButton: {
    border: 'none',
    backgroundColor: '#f0f0f0',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    color: '#2b2b2b',
    fontSize: '0.85rem',
  },
  activeNav: { backgroundColor: '#30bd82ff', color: '#fff' },
  logoutButton: {
    backgroundColor: '#c94f4f',
    border: 'none',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },

  main: { padding: '2rem', marginTop: '40px', overflowY: 'auto' },
  greeting: { fontSize: '1.9rem', fontWeight: '600', color: '#4d3333ff', marginBottom: '0.2rem' },
  subGreeting: { fontSize: '0.9rem', fontWeight: '400', color: '#2b2b2b', marginBottom: '1.5rem' },

  // Health summary cards
  healthSummary: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  healthCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '0.8rem 1rem',
    width: '180px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  healthTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  healthTitle: { fontSize: '0.85rem', fontWeight: 600, color: '#4b4b4b', margin: 0 },
  healthChart: {
    background: 'linear-gradient(90deg, rgba(123,108,246,0.2), rgba(123,108,246,0.05))',
    height: '35px',
    borderRadius: '8px',
    margin: '0.4rem 0',
  },
  healthChartOrange: {
    background: 'linear-gradient(90deg, rgba(255,127,80,0.25), rgba(255,127,80,0.05))',
    height: '35px',
    borderRadius: '8px',
    margin: '0.4rem 0',
  },
  healthChartBlue: {
    background: 'linear-gradient(90deg, rgba(77,171,247,0.25), rgba(77,171,247,0.05))',
    height: '35px',
    borderRadius: '8px',
    margin: '0.4rem 0',
  },
  waterBarOuter: {
    backgroundColor: '#e9f3ff',
    borderRadius: '8px',
    height: '8px',
    margin: '0.5rem 0',
    overflow: 'hidden',
  },
  waterBarInner: {
    backgroundColor: '#4dabf7',
    width: '89%',
    height: '100%',
    borderRadius: '8px',
  },
  healthBottom: { display: 'flex', alignItems: 'center', gap: '0.3rem' },
  healthValue: { fontSize: '1.2rem', fontWeight: 700, margin: 0 },
  healthUnit: { fontSize: '0.75rem', color: '#777' },
  normalRange: {
    fontSize: '0.65rem',
    color: '#3de413ff',
    marginTop: '0.3rem',
    textAlign: 'center',
  },

  viewAllBtn: {
    backgroundColor: '#994040ff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 0.8rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
    marginBottom: '1.5rem',
  },

  // --- Main Section Layout ---
  appointmentsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginTop: '1rem',
  },

  topRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },

  appointmentsLeft: {
    flex: '1 1 50%',
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },

  symptomsSection: {
    flex: '1 1 50%',
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },

  appointmentActionsFull: {
    width: '100%',
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },

  sectionTitle: { color: '#2b2b2b', fontSize: '1.2rem', marginBottom: '0.8rem' },

  appointmentsContainer: {
    backgroundColor: '#f0f4f8',
    padding: '0.8rem',
    borderRadius: '12px',
    boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
  },

  appointmentList: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },

  appointmentCard: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '0.5rem 0.8rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    gap: '0.5rem',
    cursor: 'pointer',
  },

  appointmentDetails: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  doctorName: { fontWeight: '700', fontSize: '0.95rem', color: '#2b2b2b', margin: 0 },
  specialization: { fontWeight: '500', fontSize: '0.8rem', color: '#6c757d', margin: '1px 0 0 0' },
  date: { fontSize: '0.75rem', color: '#4b6158', marginTop: '1px' },

  symptomList: { listStyleType: 'none', padding: 0, margin: 0 },
  symptomItem: {
    backgroundColor: '#f2f2f2',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    marginBottom: '0.5rem',
    color: '#2b2b2b',
    fontSize: '0.9rem',
  },

  appointmentRequestCard: {
    backgroundColor: '#f9f9f9',
    padding: '0.6rem 0.8rem',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  actionsBtnGroup: { display: 'flex', gap: '0.5rem' },
  acceptBtn: {
    backgroundColor: '#30bd82',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  declineBtn: {
    backgroundColor: '#c94f4f',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default ClientDashboard;
