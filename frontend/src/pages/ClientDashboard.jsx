import React, { useState, useEffect } from 'react';
import { Calendar, User, FileText, Activity, AlertCircle, Pill, FileBarChart, Heart, LogOut, Menu, X } from 'lucide-react';
import Messages from '../components/Messages';


// API Service - Direct implementation
const API_BASE_URL = 'http://localhost:5011/api';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`Invalid content type for ${endpoint}:`, contentType);
      throw new Error(`Invalid response format from ${endpoint}`);
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      console.warn(`Empty response from ${endpoint}`);
      return { success: false, data: null, message: 'Empty response' };
    }

    const data = JSON.parse(text);
    return data;
  } catch (err) {
    console.error(`API Error for ${endpoint}:`, err);
    throw err;
  }
};

const apiService = {
  getProfile: (username) => apiCall(`/client/profile/${username}`),
  updateProfile: (username, data) => apiCall(`/client/profile/${username}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  getSymptoms: (username) => apiCall(`/symptoms/client/username/${username}`),
  getDiagnoses: (username) => apiCall(`/diagnosis/client/username/${username}`),
  getAppointments: () => apiCall('/appointment'),
  getAllergies: () => apiCall('/allergy'),
  getPrescriptions: () => apiCall('/prescription'),
  getLabResults: () => apiCall('/labresult'),
  getTreatments: () => apiCall('/treatment'),
  
  // FIXED: Changed parameter names to match backend expectations
  sendMessage: (recipientUsername, recipientRole, content) => 
    apiCall('/message/send', {
      method: 'POST',
      body: JSON.stringify({ 
        ReceiverUsername: recipientUsername,  
        ReceiverRole: recipientRole,          
        Content: content                      
      })
    }),
  getMyDoctor: (username) => apiCall(`/client/profile/${username}`)
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  sidebar: {
    width: '256px',
    backgroundColor: '#1e3a8a',
    color: 'white',
    transition: 'width 0.3s',
    overflowY: 'auto'
  },
  sidebarHidden: {
    width: '0'
  },
  sidebarContent: {
    padding: '1rem'
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem'
  },
  sidebarTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  navItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '1rem'
  },
  navItemActive: {
    backgroundColor: '#1e40af'
  },
  navItemHover: {
    backgroundColor: '#1e40af'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1rem'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  headerTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  welcomeText: {
    color: '#374151'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  notification: {
    padding: '1rem',
    margin: '1rem 1.5rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  errorNotification: {
    backgroundColor: '#fee2e2',
    borderLeft: '4px solid #ef4444',
    color: '#991b1b'
  },
  successNotification: {
    backgroundColor: '#d1fae5',
    borderLeft: '4px solid #10b981',
    color: '#065f46'
  },
  notificationContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  pageContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem'
  },
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  welcomeTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem'
  },
  statBadge: {
    width: '3rem',
    height: '3rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.75rem'
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '0.875rem'
  },
  quickLinksSection: {
    marginTop: '1rem'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem'
  },
  quickLinksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },
  quickLinkCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'box-shadow 0.2s'
  },
  quickLinkIcon: {
    color: '#2563eb',
    marginBottom: '0.75rem'
  },
  quickLinkTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem',
    fontSize: '1rem'
  },
  quickLinkDesc: {
    color: '#6b7280',
    fontSize: '0.875rem'
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'start',
    gap: '0.75rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #e5e7eb'
  },
  activityDot: {
    width: '0.5rem',
    height: '0.5rem',
    backgroundColor: '#2563eb',
    borderRadius: '50%',
    marginTop: '0.5rem'
  },
  activityText: {
    color: '#1f2937',
    margin: 0
  },
  activityDate: {
    color: '#6b7280',
    fontSize: '0.875rem',
    margin: 0
  },
  profileContainer: {
    maxWidth: '64rem'
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem'
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  profileTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  },
  editButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  formLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  formInput: {
    width: '100%',
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    outline: 'none'
  },
  formInputDisabled: {
    backgroundColor: '#f3f4f6'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHead: {
    backgroundColor: '#f9fafb'
  },
  tableHeader: {
    padding: '0.75rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase'
  },
  tableCell: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e5e7eb'
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6b7280'
  },
  diagnosisCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    marginBottom: '1rem'
  },
  diagnosisHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start'
  },
  diagnosisTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem'
  },
  diagnosisText: {
    color: '#6b7280',
    marginBottom: '0.25rem'
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0.5rem'
  }
};

// Main App Component
const ClientDashboardApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [profile, setProfile] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [treatments, setTreatments] = useState([]);

  const [showComposeModal, setShowComposeModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
  recipientUsername: '',
  recipientRole: '',
  content: ''
  });

  const [allUsers, setAllUsers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      
      if (!token || !userData.userName) {
        setError('Please log in to access the dashboard');
        setLoading(false);
        return;
      }

      setUser(userData);
      await fetchAllData(userData.userName);
    } catch (err) {
      console.error('Dashboard initialization error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async (username) => {
    try {
      console.log('Fetching profile for:', username);
      const profileRes = await apiService.getProfile(username);
      if (profileRes.success || profileRes.Success) {
        setProfile(profileRes.data || profileRes.Data);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setProfile({
        firstName: userData.firstName,
        lastName: userData.lastName,
        userName: userData.userName,
        email: userData.email || '',
        phone: '',
        dateOfBirth: '',
        address: ''
      });
    }

    try {
      const symptomsRes = await apiService.getSymptoms(username);
      if (symptomsRes.success || symptomsRes.Success) {
        setSymptoms(symptomsRes.data || symptomsRes.Data || []);
      }
    } catch (err) {
      console.error('Symptoms fetch error:', err);
      setSymptoms([]);
    }

    try {
      const diagnosesRes = await apiService.getDiagnoses(username);
      if (diagnosesRes.success || diagnosesRes.Success) {
        setDiagnoses(diagnosesRes.data || diagnosesRes.Data || []);
      }
    } catch (err) {
      console.error('Diagnoses fetch error:', err);
      setDiagnoses([]);
    }

    try {
      const appointmentsRes = await apiService.getAppointments();
      if (appointmentsRes.success || appointmentsRes.Success) {
        const allAppointments = appointmentsRes.data || appointmentsRes.Data || [];
        const userAppointments = allAppointments.filter(apt => {
          const client = apt.client || apt.Client;
          return client?.userName === username || client?.UserName === username;
        });
        setAppointments(userAppointments);
      }
    } catch (err) {
      console.error('Appointments fetch error:', err);
      setAppointments([]);
    }

    try {
      const allergiesRes = await apiService.getAllergies();
      if (allergiesRes.success || allergiesRes.Success) {
        setAllergies(allergiesRes.data || allergiesRes.Data || []);
      }
    } catch (err) {
      console.error('Allergies fetch error:', err);
      setAllergies([]);
    }

    try {
      const prescriptionsRes = await apiService.getPrescriptions();
      if (prescriptionsRes.success || prescriptionsRes.Success) {
        setPrescriptions(prescriptionsRes.data || prescriptionsRes.Data || []);
      }
    } catch (err) {
      console.error('Prescriptions fetch error:', err);
      setPrescriptions([]);
    }

    try {
      const labResultsRes = await apiService.getLabResults();
      if (labResultsRes.success || labResultsRes.Success) {
        setLabResults(labResultsRes.data || labResultsRes.Data || []);
      }
    } catch (err) {
      console.error('Lab results fetch error:', err);
      setLabResults([]);
    }

    try {
      const treatmentsRes = await apiService.getTreatments();
      if (treatmentsRes.success || treatmentsRes.Success) {
        setTreatments(treatmentsRes.data || treatmentsRes.Data || []);
      }
    } catch (err) {
      console.error('Treatments fetch error:', err);
      setTreatments([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  const loadAllUsers = async () => {
    try {
      // Get assigned doctor from profile
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const profileRes = await apiService.getProfile(userData.userName);
      
      const users = [];
      
      if (profileRes.success && profileRes.data?.assignedDoctor) {
        const doc = profileRes.data.assignedDoctor;
        users.push({
          username: doc.userName,
          name: `Dr. ${doc.firstName || ''} ${doc.lastName || ''}`.trim() || doc.userName,
          role: 'Doctor'
        });
      }
  
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
      const response = await apiService.sendMessage(
        messageForm.recipientUsername,
        messageForm.recipientRole,
        messageForm.content
      );
  
      if (response.success) {
        setSuccess('Message sent successfully!');
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

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard user={user} setCurrentPage={setCurrentPage} symptoms={symptoms} diagnoses={diagnoses} appointments={appointments} prescriptions={prescriptions} labResults={labResults} />;
      case 'profile':
        return <ProfilePage profile={profile} setProfile={setProfile} setSuccess={setSuccess} setError={setError} />;
      case 'messages':
        return <MessagesPage handleComposeMessage={handleComposeMessage} showComposeModal={showComposeModal} setShowComposeModal={setShowComposeModal} messageForm={messageForm} setMessageForm={setMessageForm} handleSendMessage={handleSendMessage} allUsers={allUsers} selectedRecipient={selectedRecipient} setSelectedRecipient={setSelectedRecipient} />;
      case 'symptoms':
        return <SymptomsPage symptoms={symptoms} />;
      case 'diagnoses':
        return <DiagnosesPage diagnoses={diagnoses} />;
      case 'appointments':
        return <AppointmentsPage appointments={appointments} />;
        case 'doctor':
        return <DoctorPage profile={profile} />;
      case 'allergies':
        return <AllergiesPage allergies={allergies} />;
      case 'prescriptions':
        return <PrescriptionsPage prescriptions={prescriptions} />;
      case 'labresults':
        return <LabResultsPage labResults={labResults} />;
      case 'treatments':
        return <TreatmentsPage treatments={treatments} />;
      default:
        return <Dashboard user={user} setCurrentPage={setCurrentPage} />;
        
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '4rem', height: '4rem', border: '4px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#6b7280' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={{...styles.sidebar, ...(sidebarOpen ? {} : styles.sidebarHidden)}}>
        <div style={styles.sidebarContent}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>Ithemba CDSS</h2>
            <button onClick={() => setSidebarOpen(false)} style={styles.iconButton}>
              <X size={24} />
            </button>
          </div>
          
          <nav style={styles.nav}>
            <NavItem icon={<FileText size={20} />} text="Messages" active={currentPage === 'messages'} onClick={() => setCurrentPage('messages')} />
            <NavItem icon={<Activity size={20} />} text="Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
            <NavItem icon={<User size={20} />} text="My Profile" active={currentPage === 'profile'} onClick={() => setCurrentPage('profile')} />
            <NavItem icon={<Heart size={20} />} text="Symptoms" active={currentPage === 'symptoms'} onClick={() => setCurrentPage('symptoms')} />
            <NavItem icon={<FileText size={20} />} text="Diagnoses" active={currentPage === 'diagnoses'} onClick={() => setCurrentPage('diagnoses')} />
            <NavItem icon={<Calendar size={20} />} text="Appointments" active={currentPage === 'appointments'} onClick={() => setCurrentPage('appointments')} />
            <NavItem icon={<Activity size={20} />} text="My Doctor" active={currentPage === 'doctor'} onClick={() => setCurrentPage('doctor')} />
            <NavItem icon={<AlertCircle size={20} />} text="Allergies" active={currentPage === 'allergies'} onClick={() => setCurrentPage('allergies')} />
            <NavItem icon={<Pill size={20} />} text="Prescriptions" active={currentPage === 'prescriptions'} onClick={() => setCurrentPage('prescriptions')} />
            <NavItem icon={<FileBarChart size={20} />} text="Lab Results" active={currentPage === 'labresults'} onClick={() => setCurrentPage('labresults')} />
            <NavItem icon={<Activity size={20} />} text="Treatments" active={currentPage === 'treatments'} onClick={() => setCurrentPage('treatments')} />
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerLeft}>
              {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} style={styles.iconButton}>
                  <Menu size={24} />
                </button>
              )}
              <h1 style={styles.headerTitle}>Patient Dashboard</h1>
            </div>
            <div style={styles.headerRight}>
              <span style={styles.welcomeText}>Welcome, {user?.firstName} {user?.lastName}</span>
              <button onClick={handleLogout} style={styles.logoutButton}>
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Notifications */}
        {error && (
          <div style={{...styles.notification, ...styles.errorNotification}}>
            <div style={styles.notificationContent}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} style={styles.iconButton}>
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div style={{...styles.notification, ...styles.successNotification}}>
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} style={styles.iconButton}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* Page Content */}
        <main style={styles.pageContent}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

// Navigation Item
const NavItem = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    style={{...styles.navItem, ...(active ? styles.navItemActive : {})}}
    onMouseEnter={(e) => e.target.style.backgroundColor = '#1e40af'}
    onMouseLeave={(e) => !active && (e.target.style.backgroundColor = 'transparent')}
  >
    {icon}
    <span>{text}</span>
  </button>
);

// Dashboard Page
const Dashboard = ({ user, setCurrentPage, symptoms, diagnoses, appointments, prescriptions, labResults }) => {
  const activeSymptoms = symptoms?.filter(s => s.isActive || s.IsActive) || [];
  const upcomingAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.appointmentDate || apt.AppointmentDate);
    return aptDate >= new Date() && (apt.status || apt.Status) === 'Scheduled';
  }) || [];
  const activePrescriptions = prescriptions?.filter(p => (p.status || p.Status) === 'Active') || [];
  const pendingLabResults = labResults?.filter(lab => (lab.status || lab.Status) === 'Pending') || [];

  const statsData = [
    { label: 'Upcoming Appointments', value: upcomingAppointments.length, color: '#2563eb' },
    { label: 'Active Symptoms', value: activeSymptoms.length, color: '#eab308' },
    { label: 'Active Prescriptions', value: activePrescriptions.length, color: '#10b981' },
    { label: 'Pending Lab Results', value: pendingLabResults.length, color: '#8b5cf6' }
  ];

  const quickLinks = [
    { title: 'My Profile', desc: 'View and update personal information', icon: <User size={40} />, page: 'profile' },
    { title: 'Symptoms', desc: 'Track your health symptoms', icon: <Heart size={40} />, page: 'symptoms' },
    { title: 'Diagnoses', desc: 'View medical diagnoses', icon: <FileText size={40} />, page: 'diagnoses' },
    { title: 'Appointments', desc: 'Manage your appointments', icon: <Calendar size={40} />, page: 'appointments' },
    { title: 'My Doctor', desc: 'Contact your healthcare provider', icon: <Activity size={40} />, page: 'doctor' },
    { title: 'Allergies', desc: 'View and manage allergies', icon: <AlertCircle size={40} />, page: 'allergies' },
    { title: 'Prescriptions', desc: 'View active medications', icon: <Pill size={40} />, page: 'prescriptions' },
    { title: 'Lab Results', desc: 'Access your test results', icon: <FileBarChart size={40} />, page: 'labresults' }
  ];

  return (
    <div style={styles.dashboardContainer}>
      <h2 style={styles.welcomeTitle}>Welcome back, {user?.firstName}!</h2>
      
      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <div key={index} style={styles.statCard}>
            <div style={{...styles.statBadge, backgroundColor: stat.color}}>
              {stat.value}
            </div>
            <p style={styles.statLabel}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={styles.quickLinksSection}>
        <h3 style={styles.sectionTitle}>Quick Access</h3>
        <div style={styles.quickLinksGrid}>
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(link.page)}
              style={styles.quickLinkCard}
              onMouseEnter={(e) => e.target.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
            >
              <div style={styles.quickLinkIcon}>{link.icon}</div>
              <h4 style={styles.quickLinkTitle}>{link.title}</h4>
              <p style={styles.quickLinkDesc}>{link.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.activityCard}>
        <h3 style={styles.sectionTitle}>Recent Activity</h3>
        <div style={styles.activityList}>
          {upcomingAppointments.slice(0, 3).map((apt, idx) => (
            <div key={idx} style={styles.activityItem}>
              <div style={styles.activityDot}></div>
              <div>
                <p style={styles.activityText}>Appointment: {apt.title || apt.Title}</p>
                <p style={styles.activityDate}>{new Date(apt.appointmentDate || apt.AppointmentDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {activePrescriptions.slice(0, 2).map((rx, idx) => (
            <div key={idx} style={styles.activityItem}>
              <div style={styles.activityDot}></div>
              <div>
                <p style={styles.activityText}>Prescription: {rx.medicationName || rx.MedicationName}</p>
                <p style={styles.activityDate}>{new Date(rx.startDate || rx.StartDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Profile Page
const ProfilePage = ({ profile, setProfile, setSuccess, setError }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await apiService.updateProfile(userData.userName, formData);
      
      if (response.success || response.Success) {
        setProfile(formData);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(response.message || response.Message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.profileContainer}>
      <div style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <h2 style={styles.profileTitle}>My Profile</h2>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={loading}
            style={{...styles.editButton, opacity: loading ? 0.5 : 1}}
          >
            {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
          </button>
        </div>

        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>First Name</label>
            <input
              type="text"
              value={formData.firstName || ''}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              disabled={!isEditing}
              style={{...styles.formInput, ...(isEditing ? {} : styles.formInputDisabled)}}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Last Name</label>
            <input
              type="text"
              value={formData.lastName || ''}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              disabled={!isEditing}
              style={{...styles.formInput, ...(isEditing ? {} : styles.formInputDisabled)}}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={!isEditing}
              style={{...styles.formInput, ...(isEditing ? {} : styles.formInputDisabled)}}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Phone</label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              disabled={!isEditing}
              style={{...styles.formInput, ...(isEditing ? {} : styles.formInputDisabled)}}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth?.split('T')[0] || ''}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              disabled={!isEditing}
              style={{...styles.formInput, ...(isEditing ? {} : styles.formInputDisabled)}}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Address</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              disabled={!isEditing}
              style={{...styles.formInput, ...(isEditing ? {} : styles.formInputDisabled)}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Symptoms Page
const SymptomsPage = ({ symptoms }) => {
  return (
    <div>
      <h2 style={styles.profileTitle}>My Symptoms</h2>
      <div style={{...styles.tableContainer, marginTop: '1.5rem'}}>
        <table style={styles.table}>
          <thead style={styles.tableHead}>
            <tr>
              <th style={styles.tableHeader}>Symptom</th>
              <th style={styles.tableHeader}>Severity</th>
              <th style={styles.tableHeader}>Date Reported</th>
              <th style={styles.tableHeader}>Status</th>
            </tr>
          </thead>
          <tbody>
            {symptoms.map((symptom) => (
              <tr key={symptom.id || symptom.Id}>
                <td style={styles.tableCell}>{symptom.name || symptom.Name}</td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: (symptom.severityLevel || symptom.SeverityLevel) >= 4 ? '#fee2e2' : 
                                   (symptom.severityLevel || symptom.SeverityLevel) >= 3 ? '#fef3c7' : '#d1fae5',
                    color: (symptom.severityLevel || symptom.SeverityLevel) >= 4 ? '#991b1b' : 
                          (symptom.severityLevel || symptom.SeverityLevel) >= 3 ? '#92400e' : '#065f46'
                  }}>
                    Level {symptom.severityLevel || symptom.SeverityLevel}/5
                  </span>
                </td>
                <td style={styles.tableCell}>
                  {new Date(symptom.dateReported || symptom.DateReported || symptom.createdAt || symptom.CreatedAt).toLocaleDateString()}
                </td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: (symptom.isActive ?? symptom.IsActive) ? '#dbeafe' : '#f3f4f6',
                    color: (symptom.isActive ?? symptom.IsActive) ? '#1e40af' : '#6b7280'
                  }}>
                    {(symptom.isActive ?? symptom.IsActive) ? 'Active' : 'Resolved'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {symptoms.length === 0 && (
          <div style={styles.emptyState}>No symptoms recorded</div>
        )}
      </div>
    </div>
  );
};

// Diagnoses Page
const DiagnosesPage = ({ diagnoses }) => (
  <div>
    <h2 style={styles.profileTitle}>My Diagnoses</h2>
    <div style={{marginTop: '1.5rem'}}>
      {diagnoses.map((diagnosis) => (
        <div key={diagnosis.id || diagnosis.Id} style={styles.diagnosisCard}>
          <div style={styles.diagnosisHeader}>
            <div>
              <h3 style={styles.diagnosisTitle}>{diagnosis.title || diagnosis.Title}</h3>
              <p style={styles.diagnosisText}>Date: {new Date(diagnosis.dateDiagnosed || diagnosis.DateDiagnosed).toLocaleDateString()}</p>
            </div>
            <span style={{
              ...styles.badge,
              backgroundColor: (diagnosis.status || diagnosis.Status) === 'Active' ? '#fee2e2' : '#d1fae5',
              color: (diagnosis.status || diagnosis.Status) === 'Active' ? '#991b1b' : '#065f46'
            }}>
              {diagnosis.status || diagnosis.Status}
            </span>
          </div>
        </div>
      ))}
      {diagnoses.length === 0 && (
        <div style={{...styles.diagnosisCard, textAlign: 'center', color: '#6b7280'}}>No diagnoses recorded</div>
      )}
    </div>
  </div>
);

// Appointments Page
const AppointmentsPage = ({ appointments }) => (
  <div>
    <h2 style={styles.profileTitle}>My Appointments</h2>
    <div style={{marginTop: '1.5rem'}}>
      {appointments.map((apt) => (
        <div key={apt.id || apt.Id} style={styles.diagnosisCard}>
          <div style={styles.diagnosisHeader}>
            <div style={{display: 'flex', alignItems: 'start', gap: '1rem'}}>
              <div style={{backgroundColor: '#dbeafe', borderRadius: '0.5rem', padding: '0.75rem'}}>
                <Calendar style={{color: '#2563eb'}} size={24} />
              </div>
              <div>
                <h3 style={styles.diagnosisTitle}>{apt.title || apt.Title}</h3>
                <p style={styles.diagnosisText}>{apt.description || apt.Description}</p>
                <p style={styles.diagnosisText}>
                  {new Date(apt.appointmentDate || apt.AppointmentDate).toLocaleDateString()} at {apt.startTime || apt.StartTime}
                </p>
              </div>
            </div>
            <span style={{
              ...styles.badge,
              backgroundColor: (apt.status || apt.Status) === 'Scheduled' ? '#d1fae5' : '#f3f4f6',
              color: (apt.status || apt.Status) === 'Scheduled' ? '#065f46' : '#6b7280'
            }}>
              {apt.status || apt.Status}
            </span>
          </div>
        </div>
      ))}
      {appointments.length === 0 && (
        <div style={{...styles.diagnosisCard, textAlign: 'center', color: '#6b7280'}}>No appointments scheduled</div>
      )}
    </div>
  </div>
);

// Doctor Page
// Doctor Page
const DoctorPage = ({ profile }) => {
  const assignedDoctor = profile?.assignedDoctor;
  
  if (!assignedDoctor) {
    return (
      <div style={styles.profileContainer}>
        <h2 style={styles.profileTitle}>My Doctor</h2>
        <div style={{...styles.diagnosisCard, marginTop: '1.5rem', textAlign: 'center', color: '#6b7280'}}>
          <p>No doctor has been assigned to your account yet.</p>
          <p style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>Please contact your healthcare provider for assistance.</p>
        </div>
      </div>
    );
  }

  const doctorInitials = `${assignedDoctor.firstName?.charAt(0) || ''}${assignedDoctor.lastName?.charAt(0) || ''}`.toUpperCase();
  const doctorFullName = `Dr. ${assignedDoctor.firstName || ''} ${assignedDoctor.lastName || ''}`.trim();

  return (
    <div style={styles.profileContainer}>
      <h2 style={styles.profileTitle}>My Doctor</h2>
      <div style={{...styles.diagnosisCard, marginTop: '1.5rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem'}}>
          <div style={{width: '5rem', height: '5rem', backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 'bold'}}>
            {doctorInitials}
          </div>
          <div>
            <h3 style={styles.diagnosisTitle}>{doctorFullName}</h3>
            <p style={styles.diagnosisText}>{assignedDoctor.specialty || assignedDoctor.Specialty || 'General Practice'}</p>
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {assignedDoctor.phone && (
            <div>
              <span style={{fontSize: '0.875rem', color: '#6b7280'}}>Phone</span>
              <p style={{color: '#1f2937', margin: 0}}>{assignedDoctor.phone}</p>
            </div>
          )}
          {assignedDoctor.email && (
            <div>
              <span style={{fontSize: '0.875rem', color: '#6b7280'}}>Email</span>
              <p style={{color: '#1f2937', margin: 0}}>{assignedDoctor.email}</p>
            </div>
          )}
          {assignedDoctor.officeLocation && (
            <div>
              <span style={{fontSize: '0.875rem', color: '#6b7280'}}>Office Location</span>
              <p style={{color: '#1f2937', margin: 0}}>{assignedDoctor.officeLocation}</p>
            </div>
          )}
          <div>
            <span style={{fontSize: '0.875rem', color: '#6b7280'}}>Username</span>
            <p style={{color: '#1f2937', margin: 0}}>@{assignedDoctor.userName || assignedDoctor.UserName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Allergies Page
const AllergiesPage = ({ allergies }) => (
  <div>
    <h2 style={styles.profileTitle}>My Allergies</h2>
    <div style={{marginTop: '1.5rem'}}>
      {allergies.map((allergy) => (
        <div key={allergy.id || allergy.Id} style={styles.diagnosisCard}>
          <div style={styles.diagnosisHeader}>
            <div>
              <h3 style={styles.diagnosisTitle}>{allergy.allergyName || allergy.AllergyName}</h3>
              <p style={styles.diagnosisText}>Reaction: {allergy.reaction || allergy.Reaction}</p>
              <p style={styles.diagnosisText}>Reported: {new Date(allergy.diagnosedDate || allergy.DiagnosedDate).toLocaleDateString()}</p>
            </div>
            <span style={{
              ...styles.badge,
              backgroundColor: (allergy.severity || allergy.Severity) === 'Severe' ? '#fee2e2' :
                             (allergy.severity || allergy.Severity) === 'Moderate' ? '#fef3c7' : '#d1fae5',
              color: (allergy.severity || allergy.Severity) === 'Severe' ? '#991b1b' :
                    (allergy.severity || allergy.Severity) === 'Moderate' ? '#92400e' : '#065f46'
            }}>
              {allergy.severity || allergy.Severity}
            </span>
          </div>
        </div>
      ))}
      {allergies.length === 0 && (
        <div style={{...styles.diagnosisCard, textAlign: 'center', color: '#6b7280'}}>No allergies recorded</div>
      )}
    </div>
  </div>
);

// Prescriptions Page
const PrescriptionsPage = ({ prescriptions }) => (
  <div>
    <h2 style={styles.profileTitle}>My Prescriptions</h2>
    <div style={{marginTop: '1.5rem'}}>
      {prescriptions.map((rx) => (
        <div key={rx.id || rx.Id} style={styles.diagnosisCard}>
          <div style={styles.diagnosisHeader}>
            <div>
              <h3 style={styles.diagnosisTitle}>{rx.medicationName || rx.MedicationName}</h3>
              <p style={styles.diagnosisText}>Prescribed by: Dr. {rx.prescribedBy || 'Your Doctor'}</p>
            </div>
            <span style={{
              ...styles.badge,
              backgroundColor: (rx.status || rx.Status) === 'Active' ? '#d1fae5' : '#f3f4f6',
              color: (rx.status || rx.Status) === 'Active' ? '#065f46' : '#6b7280'
            }}>
              {rx.status || rx.Status}
            </span>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem', marginTop: '1rem'}}>
            <div>
              <span style={{color: '#6b7280'}}>Dosage:</span>
              <p style={{color: '#1f2937', margin: 0}}>{rx.dosage || rx.Dosage}</p>
            </div>
            <div>
              <span style={{color: '#6b7280'}}>Frequency:</span>
              <p style={{color: '#1f2937', margin: 0}}>{rx.frequency || rx.Frequency}</p>
            </div>
            <div style={{gridColumn: 'span 2'}}>
              <span style={{color: '#6b7280'}}>Duration:</span>
              <p style={{color: '#1f2937', margin: 0}}>
                {new Date(rx.startDate || rx.StartDate).toLocaleDateString()}
                {(rx.endDate || rx.EndDate) && ` to ${new Date(rx.endDate || rx.EndDate).toLocaleDateString()}`}
              </p>
            </div>
          </div>
        </div>
      ))}
      {prescriptions.length === 0 && (
        <div style={{...styles.diagnosisCard, textAlign: 'center', color: '#6b7280'}}>No prescriptions recorded</div>
      )}
    </div>
  </div>
);

// Lab Results Page
const LabResultsPage = ({ labResults }) => (
  <div>
    <h2 style={styles.profileTitle}>My Lab Results</h2>
    <div style={{marginTop: '1.5rem'}}>
      {labResults.map((lab) => (
        <div key={lab.id || lab.Id} style={styles.diagnosisCard}>
          <div style={styles.diagnosisHeader}>
            <div>
              <h3 style={styles.diagnosisTitle}>{lab.testName || lab.TestName}</h3>
              <p style={styles.diagnosisText}>Date: {new Date(lab.testDate || lab.TestDate).toLocaleDateString()}</p>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.5rem'}}>
              <span style={{
                ...styles.badge,
                backgroundColor: (lab.status || lab.Status) === 'Available' ? '#d1fae5' : '#fef3c7',
                color: (lab.status || lab.Status) === 'Available' ? '#065f46' : '#92400e'
              }}>
                {lab.status || lab.Status}
              </span>
              {(lab.status || lab.Status) === 'Available' && (
                <button style={{...styles.button, backgroundColor: 'transparent', color: '#2563eb', padding: '0.25rem 0.5rem'}}>
                  View Report
                </button>
              )}
            </div>
          </div>
          {(lab.result || lab.Result) !== '-' && (
            <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb'}}>
              <span style={{fontSize: '0.875rem', color: '#6b7280'}}>Result: </span>
              <span style={{
                fontWeight: '600',
                color: (lab.result || lab.Result) === 'Normal' ? '#10b981' : '#eab308'
              }}>
                {lab.result || lab.Result}
              </span>
            </div>
          )}
        </div>
      ))}
      {labResults.length === 0 && (
        <div style={{...styles.diagnosisCard, textAlign: 'center', color: '#6b7280'}}>No lab results available</div>
      )}
    </div>
  </div>
);

// Treatments Page
const TreatmentsPage = ({ treatments }) => (
  <div>
    <h2 style={styles.profileTitle}>My Treatments</h2>
    <div style={{marginTop: '1.5rem'}}>
      {treatments.map((treatment) => (
        <div key={treatment.id || treatment.Id} style={styles.diagnosisCard}>
          <div style={styles.diagnosisHeader}>
            <div>
              <h3 style={styles.diagnosisTitle}>{treatment.title || treatment.Title}</h3>
              <p style={styles.diagnosisText}>For: {treatment.condition || treatment.Description}</p>
            </div>
            <span style={{...styles.badge, backgroundColor: '#dbeafe', color: '#1e40af'}}>
              {treatment.status || treatment.Status}
            </span>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem', marginTop: '1rem'}}>
            <div>
              <span style={{color: '#6b7280'}}>Start Date:</span>
              <p style={{color: '#1f2937', margin: 0}}>{new Date(treatment.startDate || treatment.StartDate).toLocaleDateString()}</p>
            </div>
            <div>
              <span style={{color: '#6b7280'}}>Frequency:</span>
              <p style={{color: '#1f2937', margin: 0}}>{treatment.frequency || 'As prescribed'}</p>
            </div>
          </div>
        </div>
      ))}
      {treatments.length === 0 && (
        <div style={{...styles.diagnosisCard, textAlign: 'center', color: '#6b7280'}}>No treatments recorded</div>
      )}
    </div>
  </div>
);
// Messages Page
const MessagesPage = ({ 
  handleComposeMessage, 
  showComposeModal, 
  setShowComposeModal,
  messageForm,
  setMessageForm,
  handleSendMessage,
  allUsers,
  selectedRecipient,
  setSelectedRecipient
}) => (
  <div>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
      <h2 style={styles.profileTitle}>Messages</h2>
      <button
        onClick={handleComposeMessage}
        style={{...styles.editButton, backgroundColor: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
      >
        ✉️ Compose New Message
      </button>
    </div>

    {showComposeModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3>Compose Message</h3>
            <button 
              onClick={() => {
                setShowComposeModal(false);
                setMessageForm({ recipientUsername: '', recipientRole: '', content: '' });
                setSelectedRecipient(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSendMessage} style={{padding: '1.5rem'}}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>To (Recipient)*</label>
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
                style={styles.formInput}
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
              <label style={styles.formLabel}>Message*</label>
              <textarea
                value={messageForm.content}
                onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
                required
                placeholder="Type your message here..."
                rows={8}
                style={{...styles.formInput, resize: 'vertical', fontFamily: 'inherit'}}
              />
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem'}}>
              <button 
                type="button" 
                onClick={() => {
                  setShowComposeModal(false);
                  setMessageForm({ recipientUsername: '', recipientRole: '', content: '' });
                  setSelectedRecipient(null);
                }}
                style={{...styles.button, backgroundColor: '#f3f4f6', color: '#374151'}}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{...styles.button, backgroundColor: '#10b981', color: 'white'}}
              >
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

export default ClientDashboardApp;