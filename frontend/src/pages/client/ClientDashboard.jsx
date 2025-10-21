import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FaHeartbeat,
  FaTint,
  FaUserMd,
  FaRulerVertical,
  FaWeight,
  FaBirthdayCake,
  FaNotesMedical,
  FaCalendarAlt
} from "react-icons/fa";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 


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
  const {logout } = useAuth();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [profile, setProfile] = useState(null); 
  const [clinicalObservations, setClinicalObservations] = useState([]);



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

    const fetchProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    // Decode token
    const decodedToken = jwtDecode(token);
    console.log("Decoded token: ", decodedToken);

    // Extract username from the name claim
    const username =
      decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
      decodedToken.sub; // fallback in case name claim not found

    if (!username) {
      console.error("Username not found in token");
      return;
    }

    console.log("Fetching client profile for username:", username);

  
    const response = await axios.get(
      `http://localhost:5011/api/Client/by-username/${username}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Fetched profile data:", response.data);
    setProfile(response.data.data); 
  } catch (error) {
    console.error("Error fetching client profile:", error);
  }
};

const fetchClinicalObservations = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    // Hardcoded client ID for testing
    const clientId = 1; // <-- change this to whichever client you want to test

    console.log("Using hardcoded client ID:", clientId);

    // Fetch latest clinical observation
    const observationResponse = await axios.get(
      `http://localhost:5011/api/ClinicalObservation/client/${clientId}/latest`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(
      "Fetched latest clinical observation:",
      observationResponse.data
    );

    // Update your state
    setClinicalObservations(
      observationResponse.data?.data
        ? [observationResponse.data.data] // wrap single item into an array if needed
        : []
    );
  } catch (error) {
    console.error(
      "Error fetching clinical observations:",
      error.response?.data || error.message
    );
  }
};


    fetchClinicalObservations();
    fetchSymptoms();
    fetchProfile();
  }, []);


    const ProfilePage = () => (
    <div
    style={{
    padding: '1rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '2rem auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  }}
>
  {/* Header with icon and name */}
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
    <FaUserMd
      size={60}
      style={{
        borderRadius: '50%',
        backgroundColor: '#e0e0e0',
        padding: '10px',
        marginRight: '1rem',
      }}
    />
    <h2>
      {profile?.firstName} {profile?.lastName}
    </h2>
  </div>

  {/* Profile information */}
  {profile && (
    <div style={{ lineHeight: '1.5rem' }}>
      <p><strong>Username:</strong> {profile.userName}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Age:</strong> {new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()}</p>
      <p><strong>Date of Birth:</strong> {new Date(profile.dateOfBirth).toLocaleDateString()}</p>
      <p><strong>Phone:</strong> {profile.phone || 'N/A'}</p>
      <p><strong>Address:</strong> {profile.address || 'N/A'}</p>
      <p><strong>Account Created:</strong> {new Date(profile.createdAt).toLocaleString()}</p>
      <p><strong>Last Updated:</strong> {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : 'Never'}</p>
    </div>
  )}
</div>

  );


  return (
  <div style={styles.container}>
    {/* HEADER */}
    <header style={styles.header}>
      <div style={styles.logoSection}>
        <img src="/Ithemba logo.png" alt="Logo" style={styles.logo} />
        <nav style={styles.nav}>
            <button
              style={{ ...styles.navButton, ...(activeTab === 'dashboard' ? styles.activeNav : {}) }}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              style={{ ...styles.navButton, ...(activeTab === 'statistics' ? styles.activeNav : {}) }}
              onClick={() => setActiveTab('statistics')}
            >
              Statistics
            </button>
            <button
              style={{ ...styles.navButton, ...(activeTab === 'profile' ? styles.activeNav : {}) }}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
          </nav>
      </div>
      <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
    </header>

    {/* MAIN CONTENT */}
    <main style={styles.main}>
  {activeTab === 'dashboard' && (
    <>
      <h2 style={styles.greeting}>
  Hello, {profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : 'Patient'}!
</h2>
<p style={styles.subGreeting}>Welcome to your Patient Dashboard</p>


     {/* CLINICAL OBSERVATION CARDS */}
<section style={styles.healthSummary}>
  {/* Section Title */}
  <h2 style={styles.sectionTitle}>Clinical Examinations</h2>

  {clinicalObservations?.length > 0 ? (
    <div style={styles.cardGrid}>
      {clinicalObservations.map((exam, index) => (
        <React.Fragment key={index}>
          {/* Heart Rate */}
          <div style={styles.healthCard}>
            <FaHeartbeat style={{ ...styles.icon, color: "#e74c3c" }} />
            <h4 style={styles.healthTitle}>Heart Rate</h4>
            <p style={styles.healthValue}>
              {exam.heartRate || "-"} <span style={styles.healthUnit}>BPM</span>
            </p>
          </div>

          {/* Blood Pressure */}
          <div style={styles.healthCard}>
            <FaTint style={{ ...styles.icon, color: "#3498db" }} />
            <h4 style={styles.healthTitle}>Blood Pressure</h4>
            <p style={styles.healthValue}>
              {exam.bloodPressure || "-"} <span style={styles.healthUnit}>mmHg</span>
            </p>
          </div>

          {/* Gender */}
          <div style={styles.healthCard}>
            <FaUserMd style={{ ...styles.icon, color: "#8e44ad" }} />
            <h4 style={styles.healthTitle}>Gender</h4>
            <p style={styles.healthValue}>{exam.gender || "-"}</p>
          </div>

          {/* Height */}
          <div style={styles.healthCard}>
            <FaRulerVertical style={{ ...styles.icon, color: "#16a085" }} />
            <h4 style={styles.healthTitle}>Height</h4>
            <p style={styles.healthValue}>
              {exam.height || "-"} <span style={styles.healthUnit}>cm</span>
            </p>
          </div>

          {/* Weight */}
          <div style={styles.healthCard}>
            <FaWeight style={{ ...styles.icon, color: "#f39c12" }} />
            <h4 style={styles.healthTitle}>Weight</h4>
            <p style={styles.healthValue}>
              {exam.weight || "-"} <span style={styles.healthUnit}>kg</span>
            </p>
          </div>

          {/* Age */}
          <div style={styles.healthCard}>
            <FaBirthdayCake style={{ ...styles.icon, color: "#2ecc71" }} />
            <h4 style={styles.healthTitle}>Age</h4>
            <p style={styles.healthValue}>
              {exam.age || "-"} <span style={styles.healthUnit}>years</span>
            </p>
          </div>

          {/* Notes */}
          <div style={styles.healthCard}>
            <FaNotesMedical style={{ ...styles.icon, color: "#2980b9" }} />
            <h4 style={styles.healthTitle}>Notes</h4>
            <p style={styles.healthValue}>{exam.notes || "No notes recorded."}</p>
          </div>

          {/* Date */}
          <div style={styles.healthCard}>
            <FaCalendarAlt style={{ ...styles.icon, color: "#7f8c8d" }} />
            <h4 style={styles.healthTitle}>Date</h4>
            <p style={styles.healthValue}>
              {new Date(exam.observationDate).toLocaleDateString()}
            </p>
          </div>
        </React.Fragment>
      ))}
    </div>
  ) : (
    <p style={{ textAlign: "center", color: "#666" }}>No clinical observations found.</p>
  )}
</section>



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

          {/* Symptoms Identified */}
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

                      {s.notes || s.Notes ? <div>Notes: {s.notes || s.Notes}</div> : null}
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
    </>
  )}

  {activeTab === 'statistics' && (
    <div>
      <h2>Statistics</h2>
      <p>Statistics content goes here...</p>
    </div>
  )}

  {activeTab === 'profile' && <ProfilePage />}
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
  subGreeting: { fontSize: '1.1rem', fontWeight: '400', color: '#2b2b2b', marginBottom: '1.5rem' },

  healthSummary: {
  marginTop: '2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'left',
},

cardGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1.6rem',
  width: '100%',
  maxWidth: '1000px',
},

healthCard: {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  padding: '1.2rem',
  textAlign: 'center',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
},
healthCardHover: {
  transform: 'translateY(-4px)',
  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
},

icon: {
  fontSize: '1.8rem',
  marginBottom: '0.5rem',
},

healthTitle: {
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#333',
  marginBottom: '0.3rem',
},

healthValue: {
  fontSize: '1.1rem',
  fontWeight: 700,
  color: '#111',
  margin: 0,
},

healthUnit: {
  fontSize: '0.8rem',
  color: '#777',
  marginLeft: '4px',
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
