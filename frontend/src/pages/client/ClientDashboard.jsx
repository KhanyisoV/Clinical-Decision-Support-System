import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaUserMd, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaStickyNote } from "react-icons/fa";

const ClientDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]); 

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const fetchAppointments = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await axios.get("http://localhost:5011/api/Appointment", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data?.data && Array.isArray(response.data.data)) {
      // ✅ Keep all appointments, don't filter here
      setAppointments(response.data.data);
    } else {
      setAppointments([]);
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
    setAppointments([]);
  }
};

  const handleAccept = async (id) => {
  try {
    const token = localStorage.getItem("token"); // ✅ get the token

    await axios.patch(
      `http://localhost:5011/api/Appointment/${id}/accept`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status: "Accepted" } : a)
    );

    alert("Appointment accepted!");
  } catch (error) {
    console.error("Error accepting appointment:", error);
    alert("Failed to accept appointment.");
  }
};

const handleDecline = async (id) => {
  try {
    const token = localStorage.getItem("token");

    await axios.patch(
      `http://localhost:5011/api/Appointment/${id}/decline`,
      JSON.stringify("decline"), // ✅ send as raw string
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status: "Declined" } : a)
    );

    alert("Appointment declined!");
  } catch (error) {
    console.error("Error declining appointment:", error);
    alert("Failed to decline appointment.");
  }
};


  // Fetch Symptoms + Profile + Appointments on mount
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found.');
          return;
        }

        const decoded = jwtDecode(token);
        console.log('Decoded token: ', decoded);

        const clientUsername =
          decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        if (!clientUsername) {
          console.error('Client username not found in token.');
          return;
        }

        console.log('Fetching symptoms for client username:', clientUsername);

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

        const decodedToken = jwtDecode(token);
        console.log("Decoded token: ", decodedToken);

        const username =
          decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
          decodedToken.sub;

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



    fetchAppointments();
    fetchSymptoms();
    fetchProfile();
  }, []);

  // Profile Page
  // Profile Page
const ProfilePage = () => (
  <div
    style={{
      maxWidth: '650px',
      margin: '3rem auto',
      padding: '2rem',
      backgroundColor: '#f9f9f9',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      fontFamily: 'Segoe UI, sans-serif',
      color: '#2b2b2b',
    }}
  >
    {/* Header with Avatar */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem',
      }}
    >
      <FaUserMd
        size={70}
        style={{
          borderRadius: '50%',
          backgroundColor: '#d0e8f2',
          padding: '12px',
          marginRight: '1.5rem',
          color: '#4b6158',
        }}
      />
      <div>
        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '600', color: '#333' }}>
          {profile?.firstName} {profile?.lastName}
        </h2>
        <p style={{ margin: '0.2rem 0 0', color: '#777', fontSize: '0.95rem' }}>
          Patient Profile
        </p>
      </div>
    </div>

    {/* Profile Details */}
    {profile && (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
          lineHeight: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>Username:</strong></span>
          <span>{profile.userName}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>Email:</strong></span>
          <span>{profile.email}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>Age:</strong></span>
          <span>{new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>Date of Birth:</strong></span>
          <span>{new Date(profile.dateOfBirth).toLocaleDateString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>Phone:</strong></span>
          <span>{profile.phone || 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>Address:</strong></span>
          <span>{profile.address || 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>Account Created:</strong></span>
          <span>{new Date(profile.createdAt).toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>Last Updated:</strong></span>
          <span>{profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : 'Never'}</span>
        </div>
      </div>
    )}

    {/* Edit Profile Button */}
    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
      <button
        style={{
          backgroundColor: '#30bd82',
          color: '#fff',
          border: 'none',
          padding: '0.8rem 1.8rem',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#28a76b')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#30bd82')}
        onClick={() => alert('Edit Profile Clicked!')} // Replace with your edit function
      >
        Edit Profile
      </button>
    </div>
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

          {/* === Upcoming Appointments === */}
          <section style={styles.fullWidthSection}>
            <h3 style={styles.sectionTitle}>Upcoming Appointments</h3>
            <div style={styles.horizontalScrollContainer}>
              {appointments.filter(a => a.status === "Accepted").length > 0 ? (
                appointments
                  .filter(a => a.status === "Accepted")
                  .map((appt) => (
                    <div key={appt.id} style={styles.appointmentCardHorizontal}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <FaUserMd size={34} color="#4b6158" style={{ marginRight: '0.6rem', flexShrink: 0 }} />
                        <div>
                          <h4 style={styles.doctorName}>
                            Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                          </h4>
                          <p style={styles.specialization}>{appt.doctor?.specialization}</p>
                        </div>
                      </div>

                      <div style={styles.infoRow}>
                        <FaCalendarAlt style={styles.icon} />
                        <span>{new Date(appt.appointmentDate).toLocaleDateString()}</span>
                      </div>

                      <div style={styles.infoRow}>
                        <FaClock style={styles.icon} />
                        <span>{appt.startTime} - {appt.endTime}</span>
                      </div>

                      <div style={styles.infoRow}>
                        <FaMapMarkerAlt style={styles.icon} />
                        <span>{appt.location}</span>
                      </div>

                      {appt.notes && (
                        <div style={styles.infoRow}>
                          <FaStickyNote style={styles.icon} />
                          <span style={{ fontStyle: 'italic' }}>{appt.notes}</span>
                        </div>
                      )}

                      <div
                        style={{
                          ...styles.statusTag,
                          backgroundColor:
                            appt.status === "Accepted"
                              ? "#c8e6c9"
                              : appt.status === "Declined"
                              ? "#ffcdd2"
                              : "#fff9c4",
                          color:
                            appt.status === "Accepted"
                              ? "#2e7d32"
                              : appt.status === "Declined"
                              ? "#c62828"
                              : "#f9a825",
                        }}
                      >
                        {appt.status}
                      </div>
                    </div>
                  ))
              ) : (
                <p>No upcoming appointments.</p>
              )}
            </div>
          </section>

          {/* === Symptoms Identified === */}
          <section style={styles.fullWidthSection}>
            <h3 style={styles.sectionTitle}>Symptoms Identified</h3>
            <div style={styles.fullContentBox}>
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
          </section>

          {/* === Appointment Requests === */}
          <section style={styles.fullWidthSection}>
            <h3 style={styles.sectionTitle}>Appointment Requests</h3>
            <div style={styles.fullContentBox}>
              {appointments.filter(a => a.status === "Scheduled").length === 0 ? (
                <p>No appointment requests available.</p>
              ) : (
                appointments
                  .filter(a => a.status === "Scheduled")
                  .map((appt) => (
                    <div key={appt.id} style={styles.appointmentRequestCard}>
                      <p>
                        <strong>
                          {appt.doctor?.firstName} {appt.doctor?.lastName}
                        </strong>{" "}
                        - {new Date(appt.appointmentDate).toLocaleDateString()}
                      </p>

                      <p>
                        <strong>Location:</strong> {appt.location || "Not specified"}
                      </p>
                      <p>
                        <strong>Status:</strong> {appt.status}
                      </p>

                      {/* Show Accept/Decline buttons only for scheduled appointments */}
                      <div style={styles.actionsBtnGroup}>
                        <button
                          style={styles.acceptBtn}
                          onClick={() => handleAccept(appt.id)}
                        >
                          Accept
                        </button>
                        <button
                          style={styles.declineBtn}
                          onClick={() => handleDecline(appt.id)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>
        </>
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

  // --- HEADER ---
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

  // --- MAIN CONTENT ---
  main: {
    padding: '2rem',
    marginTop: '70px',
    overflowY: 'auto',
  },

  greeting: {
    fontSize: '1.9rem',
    fontWeight: '600',
    color: '#4d3333ff',
    marginBottom: '0.2rem',
  },

  subGreeting: {
    fontSize: '1.1rem',
    fontWeight: '400',
    color: '#2b2b2b',
    marginBottom: '1.5rem',
  },

  // --- APPOINTMENTS SECTION ---
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
    flex: 1,
    maxWidth: '100%',
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },

  // --- Horizontal Scroll Container ---
  horizontalScrollContainer: {
    display: 'flex',
    overflowX: 'auto',
    gap: '1rem',
    paddingBottom: '0.5rem',
    scrollBehavior: 'smooth',
    whiteSpace: 'nowrap',
  },

  // --- Individual Appointment Card ---
  appointmentCardHorizontal: {
    flex: '0 0 auto',
    width: '260px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    padding: '1rem',
    whiteSpace: 'normal',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    cursor: 'pointer',
  },

  appointmentCardHorizontalHover: {
    transform: 'translateY(-3px)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  },

  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#444',
    marginBottom: '4px',
  },

  icon: {
    color: '#4b6158',
    minWidth: '18px',
  },

  doctorName: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#222',
  },

  specialization: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#555',
  },

  statusTag: {
    display: 'inline-block',
    marginTop: '6px',
    padding: '3px 8px',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '0.8rem',
    textAlign: 'center',
    alignSelf: 'flex-start',
  },

  // --- Full Width Section Wrapper ---
  fullWidthSection: {
    width: '100%',
    marginBottom: '2rem',
  },

  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#2e4038',
  },

  fullContentBox: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },

  // --- SYMPTOMS SECTION ---
  symptomList: { listStyleType: 'none', padding: 0, margin: 0 },

  symptomItem: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f2f2f2',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    marginBottom: '0.5rem',
    color: '#2b2b2b',
    fontSize: '0.9rem',
  },

  // --- APPOINTMENT REQUEST SECTION ---
  appointmentRequestCard: {
    backgroundColor: '#f9f9f9',
    padding: '0.6rem 0.8rem',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
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
 // eslint-disable-next-line
 horizontalScrollContainer: {
  display: 'flex',
  overflowX: 'auto',
  gap: '1rem',
  paddingBottom: '0.5rem',
  scrollBehavior: 'smooth',
  whiteSpace: 'nowrap',
  // Firefox scrollbar
  scrollbarWidth: 'thin',
  scrollbarColor: '#30bd82 #f0f0f0',
},
};

export default ClientDashboard;
