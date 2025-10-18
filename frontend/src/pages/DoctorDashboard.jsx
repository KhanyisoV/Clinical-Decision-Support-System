import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  FileText, 
  Activity, 
  Search,
  ChevronRight,
  AlertCircle,
  LogOut,
  X,
  Save,
  Eye,
  Stethoscope,
  ClipboardList,
  Trash2,
  Edit,
  Clock,
  MapPin,
  Plus
} from 'lucide-react';
import { doctorService, symptomService, diagnosisService, appointmentService } from '../services/apiService';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingDiagnoses: 0,
    activeTreatments: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({});
  const [patientHistory, setPatientHistory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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
      await fetchDashboardData(userData.userName);
      await fetchAppointments();
    } catch (err) {
      console.error('Dashboard initialization error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (username) => {
    try {
      try {
        const profileResponse = await doctorService.getProfile(username);
        
        if (profileResponse.success || profileResponse.Success) {
          const profileData = profileResponse.data || profileResponse.Data;
          
          setUser(prev => ({
            ...prev,
            ...profileData,
            id: profileData.id || profileData.Id
          }));
          
          const updatedUser = {
            ...JSON.parse(localStorage.getItem('user') || '{}'),
            ...profileData,
            id: profileData.id || profileData.Id
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (profileErr) {
        console.error('Profile fetch failed:', profileErr);
        setError('Failed to load doctor profile. Please try logging in again.');
        return;
      }

      const patientsResponse = await doctorService.getAssignedClients(username);
      
      if (patientsResponse.success || patientsResponse.Success) {
        const patientsList = patientsResponse.data || patientsResponse.Data || [];
        setPatients(patientsList);
        
        setStats(prev => ({
          ...prev,
          totalPatients: patientsList.length
        }));
      } else {
        setPatients([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Some data could not be loaded');
    }
  };
  const fetchAppointments = async (doctorId) => {
    try {
      const response = await appointmentService.getAllAppointments();
      
      if (response.success || response.Success) {
        const appointmentsList = response.data || response.Data || [];
        
        // Filter appointments for current doctor
        const doctorAppointments = appointmentsList.filter(apt => 
          (apt.doctorId || apt.DoctorId) === doctorId
        );
        
        setAppointments(doctorAppointments);
        
        // Update stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayAppointments = doctorAppointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate || apt.AppointmentDate);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime();
        });
        
        setStats(prev => ({
          ...prev,
          todayAppointments: todayAppointments.length
        }));
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };
  
  const handleCreateAppointment = (patient) => {
    setSelectedPatient(patient);
    
    const clientId = patient.id || patient.Id;
    const doctorId = user?.id || user?.Id;
    
    if (!clientId) {
      setError('Cannot create appointment: Patient ID not found');
      return;
    }
    
    if (!doctorId) {
      setError('Cannot create appointment: Doctor ID not found. Please refresh the page.');
      return;
    }
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData({
      Title: '',
      Description: '',
      AppointmentDate: tomorrow.toISOString().split('T')[0],
      StartTime: '09:00',
      EndTime: '10:00',
      Status: 'Scheduled',
      Location: '',
      Notes: '',
      ClientId: clientId,
      DoctorId: doctorId
    });
    setShowModal('createAppointment');
  };
  
  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    
    const aptDate = new Date(appointment.appointmentDate || appointment.AppointmentDate);
    const dateStr = aptDate.toISOString().split('T')[0];
    
    // Convert TimeSpan to HH:MM format
    const formatTime = (timeSpan) => {
      if (typeof timeSpan === 'string' && timeSpan.includes(':')) {
        return timeSpan.substring(0, 5); // Get HH:MM from HH:MM:SS
      }
      return timeSpan;
    };
    
    setFormData({
      Title: appointment.title || appointment.Title || '',
      Description: appointment.description || appointment.Description || '',
      AppointmentDate: dateStr,
      StartTime: formatTime(appointment.startTime || appointment.StartTime),
      EndTime: formatTime(appointment.endTime || appointment.EndTime),
      Status: appointment.status || appointment.Status || 'Scheduled',
      Location: appointment.location || appointment.Location || '',
      Notes: appointment.notes || appointment.Notes || '',
      ClientId: appointment.clientId || appointment.ClientId,
      DoctorId: appointment.doctorId || appointment.DoctorId
    });
    setShowModal('editAppointment');
  };
  
  const handleDeleteAppointment = (appointmentId) => {
    setDeleteConfirm({
      type: 'appointment',
      id: appointmentId,
      message: 'Are you sure you want to delete this appointment? This action cannot be undone.'
    });
  };
  
  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Convert HH:MM to TimeSpan format (HH:MM:SS)
      const appointmentData = {
        ...formData,
        StartTime: formData.StartTime + ':00',
        EndTime: formData.EndTime + ':00'
      };
      
      const response = await appointmentService.createAppointment(appointmentData);
      
      if (response.success || response.Success) {
        setSuccess('Appointment created successfully!');
        setShowModal(null);
        setFormData({});
        setSelectedPatient(null);
        await fetchAppointments();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || response.Message || 'Failed to create appointment');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating appointment');
      console.error('Appointment submission error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const appointmentId = selectedAppointment.id || selectedAppointment.Id;
      
      // Convert HH:MM to TimeSpan format (HH:MM:SS)
      const appointmentData = {
        ...formData,
        StartTime: formData.StartTime + ':00',
        EndTime: formData.EndTime + ':00'
      };
      
      const response = await appointmentService.updateAppointment(appointmentId, appointmentData);
      
      if (response.success || response.Success) {
        setSuccess('Appointment updated successfully!');
        setShowModal(null);
        setFormData({});
        setSelectedAppointment(null);
        await fetchAppointments();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || response.Message || 'Failed to update appointment');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating appointment');
      console.error('Appointment update error:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleViewPatientHistory = async (patient) => {
    setSelectedPatient(patient);
    setLoading(true);
    setError(null);

    try {
      const diagnosesRes = await diagnosisService.getDiagnosesByClientUsername(patient.userName);
      const symptomsRes = await symptomService.getSymptomsByClientUsername(patient.userName);

      const diagnoses = (diagnosesRes.success || diagnosesRes.Success)
        ? (diagnosesRes.data || diagnosesRes.Data || [])
        : [];

      const symptoms = (symptomsRes.success || symptomsRes.Success)
        ? (symptomsRes.data || symptomsRes.Data || [])
        : [];

      setPatientHistory({
        diagnoses,
        symptoms
      });

      setShowModal('patientHistory');
    } catch (err) {
      setError(err.message || 'Failed to load patient history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiagnosis = (diagnosisId) => {
    setDeleteConfirm({
      type: 'diagnosis',
      id: diagnosisId,
      message: 'Are you sure you want to delete this diagnosis? This action cannot be undone.'
    });
  };

  const handleDeleteSymptom = (symptomId) => {
    setDeleteConfirm({
      type: 'symptom',
      id: symptomId,
      message: 'Are you sure you want to delete this symptom? This action cannot be undone.'
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      if (deleteConfirm.type === 'diagnosis') {
        response = await diagnosisService.deleteDiagnosis(deleteConfirm.id);
      } else if (deleteConfirm.type === 'symptom') {
        response = await symptomService.deleteSymptom(deleteConfirm.id);
      } else if (deleteConfirm.type === 'appointment') {
        response = await appointmentService.deleteAppointment(deleteConfirm.id);
      }

      if (response.success || response.Success) {
        setSuccess(`${deleteConfirm.type.charAt(0).toUpperCase() + deleteConfirm.type.slice(1)} deleted successfully!`);
        
        // Refresh patient history
        if (selectedPatient) {
          await handleViewPatientHistory(selectedPatient);
        }
        
        // Refresh appointments if appointment was deleted
        if (deleteConfirm.type === 'appointment') {
          await fetchAppointments();
        }
        
        setTimeout(() => setSuccess(null), 3000);
      }
      else {
        setError(response.message || response.Message || 'Failed to delete');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while deleting');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  const handleCreateDiagnosis = (patient) => {
    setSelectedPatient(patient);
    
    const clientId = patient.id || patient.Id;
    const doctorId = user?.id || user?.Id;
    
    if (!clientId) {
      setError('Cannot create diagnosis: Patient ID not found');
      return;
    }

    if (!doctorId) {
      setError('Cannot create diagnosis: Doctor ID not found. Please refresh the page.');
      return;
    }

    setFormData({
      Title: '',
      Description: '',
      DiagnosisCode: '',
      Severity: 1,
      Status: 'Active',
      TreatmentPlan: '',
      Notes: '',
      ClientId: clientId,
      DoctorId: doctorId,
      DiagnosedByDoctorId: doctorId
    });
    setShowModal('createDiagnosis');
  };

  const handleCreateSymptom = (patient) => {
    setSelectedPatient(patient);
    
    const clientId = patient.id || patient.Id;
    const doctorId = user?.id || user?.Id;
    
    if (!clientId) {
      setError('Cannot create symptom: Patient ID not found');
      return;
    }

    if (!doctorId) {
      setError('Cannot create symptom: Doctor ID not found. Please refresh the page.');
      return;
    }

    setFormData({
      name: '',
      description: '',
      severityLevel: 1,
      notes: '',
      clientId: clientId,
      addedByDoctorId: doctorId
    });
    setShowModal('createSymptom');
  };

  const handleSubmitDiagnosis = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await diagnosisService.createDiagnosis(formData);
      
      if (response.success || response.Success) {
        setSuccess('Diagnosis created successfully!');
        setShowModal(null);
        setFormData({});
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || response.Message || 'Failed to create diagnosis');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating diagnosis');
      console.error('Diagnosis submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSymptom = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await symptomService.createSymptom(formData);
      
      if (response.success || response.Success) {
        setSuccess('Symptom recorded successfully!');
        setShowModal(null);
        setFormData({});
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || response.Message || 'Failed to record symptom');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while recording symptom');
      console.error('Symptom submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const closeModal = () => {
    setShowModal(null);
    setSelectedPatient(null);
    setFormData({});
    setPatientHistory(null);
    setError(null);
  };

  const filteredPatients = patients.filter(patient =>
    patient.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '1rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <style>{dashboardStyles}</style>
      
      <header className="header">
        <div className="header-left">
          <h1 className="title">Doctor Dashboard</h1>
          <p className="subtitle">
            Welcome back, Dr. {user?.firstName || user?.userName}
          </p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="avatar">
              {(user?.firstName?.[0] || user?.userName?.[0] || 'D').toUpperCase()}
            </div>
            <div>
              <div className="user-name">
                Dr. {user?.firstName} {user?.lastName}
              </div>
              <div className="user-role">{user?.specialization || 'Medical Doctor'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="close-banner">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="success-banner">
          <Activity size={20} />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="close-banner">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="tabs">
        <button
          className={activeTab === 'overview' ? 'tab tab-active' : 'tab'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'patients' ? 'tab tab-active' : 'tab'}
          onClick={() => setActiveTab('patients')}
        >
          My Patients ({patients.length})
        </button>
        <button
          className={activeTab === 'appointments' ? 'tab tab-active' : 'tab'}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments ({appointments.length})
        </button>
      </div>

      <main className="main">
        {activeTab === 'overview' && (
          <div className="overview">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue">
                  <Users size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats.totalPatients}</div>
                  <div className="stat-label">Total Patients</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-green">
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats.todayAppointments}</div>
                  <div className="stat-label">Today's Appointments</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-yellow">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats.pendingDiagnoses}</div>
                  <div className="stat-label">Pending Reviews</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-purple">
                  <Activity size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats.activeTreatments}</div>
                  <div className="stat-label">Active Treatments</div>
                </div>
              </div>
            </div>

            <div className="section">
              <div className="section-header">
                <h2 className="section-title">Recent Patients</h2>
                <button 
                  className="view-all-btn"
                  onClick={() => setActiveTab('patients')}
                >
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="patients-list">
                {patients.slice(0, 5).map((patient, index) => (
                  <div key={index} className="patient-item">
                    <div className="patient-avatar">
                      {(patient.firstName?.[0] || patient.userName?.[0] || 'P').toUpperCase()}
                    </div>
                    <div className="patient-info">
                      <div className="patient-name">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="patient-username">@{patient.userName}</div>
                    </div>
                    <div className="patient-actions">
                      <button 
                        className="action-btn-small"
                        onClick={() => handleViewPatientHistory(patient)}
                        title="View History"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="action-btn-small"
                        onClick={() => handleCreateDiagnosis(patient)}
                        title="New Diagnosis"
                      >
                        <Stethoscope size={16} />
                      </button>
                      
                      <button 
                        className="action-btn-small"
                        onClick={() => handleCreateSymptom(patient)}
                        title="Add Symptom"
                      >
                        <ClipboardList size={16} />
                      </button>
                      <button  className="action-btn-small" onClick={() => handleCreateAppointment(patient)}>
                      <Calendar size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {patients.length === 0 && (
                  <div className="empty-state">
                    <Users size={48} color="#9ca3af" />
                    <p className="empty-text">No patients assigned yet</p>
                    <p className="empty-subtext">Patients will appear here once assigned by an admin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="patients-view">
            <div className="search-bar">
              <Search size={20} color="#6b7280" />
              <input
                type="text"
                placeholder="Search patients by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="patients-grid">
              {filteredPatients.map((patient, index) => (
                <div key={index} className="patient-card">
                  <div className="patient-card-header">
                    <div className="patient-card-avatar">
                      {(patient.firstName?.[0] || patient.userName?.[0] || 'P').toUpperCase()}
                    </div>
                    <div className="patient-card-info">
                      <div className="patient-card-name">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="patient-card-username">@{patient.userName}</div>
                      {patient.email && (
                        <div className="patient-card-email">{patient.email}</div>
                      )}
                      {patient.dateOfBirth && (
                        <div className="patient-card-dob">
                          DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="patient-card-actions">
                    <button 
                      className="primary-btn"
                      onClick={() => handleViewPatientHistory(patient)}
                    >
                      <Eye size={16} />
                      View History
                    </button>
                    <button 
                      className="secondary-btn"
                      onClick={() => handleCreateDiagnosis(patient)}
                    >
                      <Stethoscope size={16} />
                      Diagnose
                    </button>
                  </div>
                  <button 
                    className="tertiary-btn"
                    onClick={() => handleCreateSymptom(patient)}
                  >
                    <ClipboardList size={16} />
                    Add Symptom
                  </button>
                  <button 
                    className="tertiary-btn"
                    onClick={() => handleCreateAppointment(patient)}
                    style={{marginTop: '0.5rem'}}
                  >
                    <Calendar size={16} />
                    Schedule Appointment
                  </button>
                </div>
              ))}
              {filteredPatients.length === 0 && (
                <div className="empty-state" style={{gridColumn: '1 / -1'}}>
                  <Users size={64} color="#9ca3af" />
                  <p className="empty-text">No patients found</p>
                  {searchTerm && (
                    <p className="empty-subtext">
                      Try adjusting your search terms
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
        )}{activeTab === 'appointments' && (
          <div className="appointments-view">
            <div className="section-header" style={{marginBottom: '1.5rem'}}>
              <h2 className="section-title">Appointments Schedule</h2>
            </div>

            {appointments.length === 0 ? (
              <div className="empty-state">
                <Calendar size={64} color="#9ca3af" />
                <p className="empty-text">No appointments scheduled</p>
                <p className="empty-subtext">Schedule appointments for your patients from the Patients tab</p>
              </div>
            ) : (
              <div className="appointments-grid">
                {appointments
                  .sort((a, b) => {
                    const dateA = new Date(a.appointmentDate || a.AppointmentDate);
                    const dateB = new Date(b.appointmentDate || b.AppointmentDate);
                    return dateB - dateA;
                  })
                  .map((appointment, index) => {
                    const aptDate = new Date(appointment.appointmentDate || appointment.AppointmentDate);
                    const isUpcoming = aptDate >= new Date();
                    const status = appointment.status || appointment.Status;
                    
                    return (
                      <div key={index} className="appointment-card">
                        <div className="appointment-card-header">
                          <div>
                            <div className="appointment-card-title">
                              {appointment.title || appointment.Title}
                            </div>
                            <div className="appointment-card-date">
                              <Clock size={14} />
                              {aptDate.toLocaleDateString()} at {appointment.startTime || appointment.StartTime}
                            </div>
                          </div>
                          <span className={`status-badge status-${status.toLowerCase()}`}>
                            {status}
                          </span>
                        </div>

                        <div className="appointment-card-body">
                          <div className="appointment-card-info">
                            <strong>Patient:</strong>
                            <span>
                              {appointment.client?.firstName || appointment.Client?.FirstName}{' '}
                              {appointment.client?.lastName || appointment.Client?.LastName}
                            </span>
                          </div>

                          {(appointment.location || appointment.Location) && (
                            <div className="appointment-card-info">
                              <MapPin size={14} />
                              <span>{appointment.location || appointment.Location}</span>
                            </div>
                          )}

                          {(appointment.description || appointment.Description) && (
                            <p className="appointment-card-description">
                              {appointment.description || appointment.Description}
                            </p>
                          )}
                        </div>

                        <div className="appointment-card-actions">
                          <button 
                            className="secondary-btn"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          <button 
                            className="delete-btn-small"
                            onClick={() => handleDeleteAppointment(appointment.id || appointment.Id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button onClick={() => setDeleteConfirm(null)} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <AlertCircle size={48} color="#ef4444" />
                <p>{deleteConfirm.message}</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setDeleteConfirm(null)} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="delete-btn" 
                  disabled={loading}
                >
                  <Trash2 size={18} />
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient History Modal */}
      {showModal === 'patientHistory' && selectedPatient && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Patient History: {selectedPatient.firstName} {selectedPatient.lastName}</h2>
              <button onClick={closeModal} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {loading ? (
                <div className="modal-loading">
                  <div className="spinner"></div>
                  <p>Loading patient history...</p>
                </div>
              ) : (
                <>
                  <div className="history-section">
                    <h3>Diagnoses ({patientHistory?.diagnoses?.length || 0})</h3>
                    {patientHistory?.diagnoses?.length > 0 ? (
                      <div className="history-list">
                        {patientHistory.diagnoses.map((diagnosis, idx) => (
                          <div key={idx} className="history-item">
                            <div className="history-item-header">
                              <strong>{diagnosis.title || diagnosis.Title}</strong>
                              <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                <span className={`status-badge status-${(diagnosis.status || diagnosis.Status)?.toLowerCase()}`}>
                                  {diagnosis.status || diagnosis.Status}
                                </span>
                                <button 
                                  className="delete-icon-btn"
                                  onClick={() => handleDeleteDiagnosis(diagnosis.id || diagnosis.Id)}
                                  title="Delete diagnosis"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <p>{diagnosis.description || diagnosis.Description}</p>
                            
                            {(diagnosis.diagnosisCode || diagnosis.DiagnosisCode) && (
                              <div style={{marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280'}}>
                                <strong>Code:</strong> {diagnosis.diagnosisCode || diagnosis.DiagnosisCode}
                              </div>
                            )}
                            
                            {(diagnosis.treatmentPlan || diagnosis.TreatmentPlan) && (
                              <div style={{marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#f0f9ff', borderRadius: '6px', borderLeft: '3px solid #3b82f6'}}>
                                <strong style={{display: 'block', marginBottom: '0.25rem', color: '#1e40af', fontSize: '0.875rem'}}>Treatment Plan:</strong>
                                <p style={{margin: 0, fontSize: '0.875rem', color: '#1e3a8a', whiteSpace: 'pre-wrap'}}>{diagnosis.treatmentPlan || diagnosis.TreatmentPlan}</p>
                              </div>
                            )}
                            
                            {(diagnosis.notes || diagnosis.Notes) && (
                              <div style={{marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '6px', borderLeft: '3px solid #f59e0b'}}>
                                <strong style={{display: 'block', marginBottom: '0.25rem', color: '#92400e', fontSize: '0.875rem'}}>Notes:</strong>
                                <p style={{margin: 0, fontSize: '0.875rem', color: '#78350f', whiteSpace: 'pre-wrap'}}>{diagnosis.notes || diagnosis.Notes}</p>
                              </div>
                            )}
                            
                            <div className="history-item-meta">
                              <span>Severity: {diagnosis.severity || diagnosis.Severity}/5</span>
                              <span>Date: {new Date(diagnosis.dateDiagnosed || diagnosis.DateDiagnosed || diagnosis.createdAt || diagnosis.CreatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">No diagnoses recorded</p>
                    )}
                  </div>

                  <div className="history-section">
                    <h3>Symptoms ({patientHistory?.symptoms?.length || 0})</h3>
                    {patientHistory?.symptoms?.length > 0 ? (
                      <div className="history-list">
                        {patientHistory.symptoms.map((symptom, idx) => (
                          <div key={idx} className="history-item">
                            <div className="history-item-header">
                              <strong>{symptom.name}</strong>
                              <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                <span className="severity-badge">
                                  Severity: {symptom.severityLevel}/5
                                </span>
                                <button 
                                  className="delete-icon-btn"
                                  onClick={() => handleDeleteSymptom(symptom.id)}
                                  title="Delete symptom"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            {symptom.description && <p>{symptom.description}</p>}
                            <div className="history-item-meta">
                              <span>Reported: {new Date(symptom.dateReported || symptom.createdAt).toLocaleDateString()}</span>
                              {symptom.isActive && <span className="active-indicator">Active</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">No symptoms recorded</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Diagnosis Modal */}
      {showModal === 'createDiagnosis' && selectedPatient && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Diagnosis for {selectedPatient.firstName} {selectedPatient.lastName}</h2>
              <button onClick={closeModal} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitDiagnosis} className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Type 2 Diabetes"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  required
                  rows="3"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed description of the diagnosis"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Diagnosis Code</label>
                  <input
                    type="text"
                    value={formData.diagnosisCode || ''}
                    onChange={(e) => setFormData({...formData, diagnosisCode: e.target.value})}
                    placeholder="ICD-10 code"
                  />
                </div>

                <div className="form-group">
                  <label>Severity (1-5) *</label>
                  <select
                    required
                    value={formData.severity || 1}
                    onChange={(e) => setFormData({...formData, severity: parseInt(e.target.value)})}
                  >
                    <option value="1">1 - Mild</option>
                    <option value="2">2 - Moderate</option>
                    <option value="3">3 - Significant</option>
                    <option value="4">4 - Severe</option>
                    <option value="5">5 - Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Treatment Plan</label>
                <textarea
                  rows="3"
                  value={formData.treatmentPlan || ''}
                  onChange={(e) => setFormData({...formData, treatmentPlan: e.target.value})}
                  placeholder="Recommended treatment approach"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes"
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Create Diagnosis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Symptom Modal */}
      {showModal === 'createSymptom' && selectedPatient && (
        <div className="modal-overlay" onClick={closeModal}>
          {/* ... symptom modal content ... */}
        </div>
      )}

      {/* Create Appointment Modal */}
      {showModal === 'createAppointment' && selectedPatient && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule Appointment for {selectedPatient.firstName} {selectedPatient.lastName}</h2>
              <button onClick={closeModal} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitAppointment} className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  required
                  value={formData.Title || ''}
                  onChange={(e) => setFormData({...formData, Title: e.target.value})}
                  placeholder="e.g., Follow-up Consultation"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                  placeholder="Purpose of the appointment"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.AppointmentDate || ''}
                    onChange={(e) => setFormData({...formData, AppointmentDate: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select
                    required
                    value={formData.Status || 'Scheduled'}
                    onChange={(e) => setFormData({...formData, Status: e.target.value})}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.StartTime || ''}
                    onChange={(e) => setFormData({...formData, StartTime: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.EndTime || ''}
                    onChange={(e) => setFormData({...formData, EndTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.Location || ''}
                  onChange={(e) => setFormData({...formData, Location: e.target.value})}
                  placeholder="e.g., Room 301, Building A"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="2"
                  value={formData.Notes || ''}
                  onChange={(e) => setFormData({...formData, Notes: e.target.value})}
                  placeholder="Additional notes"
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Scheduling...' : 'Schedule Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showModal === 'editAppointment' && selectedAppointment && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Appointment</h2>
              <button onClick={closeModal} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateAppointment} className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  required
                  value={formData.Title || ''}
                  onChange={(e) => setFormData({...formData, Title: e.target.value})}
                  placeholder="e.g., Follow-up Consultation"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                  placeholder="Purpose of the appointment"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.AppointmentDate || ''}
                    onChange={(e) => setFormData({...formData, AppointmentDate: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select
                    required
                    value={formData.Status || 'Scheduled'}
                    onChange={(e) => setFormData({...formData, Status: e.target.value})}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.StartTime || ''}
                    onChange={(e) => setFormData({...formData, StartTime: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.EndTime || ''}
                    onChange={(e) => setFormData({...formData, EndTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.Location || ''}
                  onChange={(e) => setFormData({...formData, Location: e.target.value})}
                  placeholder="e.g., Room 301, Building A"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="2"
                  value={formData.Notes || ''}
                  onChange={(e) => setFormData({...formData, Notes: e.target.value})}
                  placeholder="Additional notes"
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Updating...' : 'Update Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div> 
  );  
};

const dashboardStyles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  .tertiary-btn:hover {
    background-color: #e5e7eb;
  }
    .appointments-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .appointments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .appointment-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: all 0.2s;
    border-left: 4px solid #3b82f6;
  }

  .appointment-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  .appointment-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .appointment-card-title {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .appointment-card-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .appointment-card-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .appointment-card-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #374151;
  }

  .appointment-card-info strong {
    color: #111827;
    min-width: 60px;
  }

  .appointment-card-description {
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;
    margin: 0;
  }

  .appointment-card-actions {
    display: flex;
    gap: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .delete-btn-small {
    padding: 0.625rem 1rem;
    background-color: #fee2e2;
    color: #ef4444;
    border: 1px solid #fecaca;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }

  .delete-btn-small:hover {
    background-color: #fecaca;
    border-color: #fca5a5;
  }

  .status-scheduled {
    background-color: #dbeafe;
    color: #1e40af;
  }

  .status-confirmed {
    background-color: #d1fae5;
    color: #065f46;
  }

  .status-rescheduled {
    background-color: #fef3c7;
    color: #92400e;
  }

  .status-cancelled {
    background-color: #fee2e2;
    color: #991b1b;
  }

  .status-completed {
    background-color: #e9d5ff;
    color: #6b21a8;
  }
  .dashboard-container {
    min-height: 100vh;
    background-color: #f9fafb;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  }
  
  .header {
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .title {
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.25rem;
  }
  
  .subtitle {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .user-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
  }
  
  .user-role {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .logout-btn:hover {
    background-color: #dc2626;
    transform: translateY(-1px);
  }
  
  .error-banner, .success-banner {
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .error-banner {
    background-color: #fef2f2;
    border-left: 4px solid #ef4444;
    color: #991b1b;
  }
  
  .success-banner {
    background-color: #f0fdf4;
    border-left: 4px solid #10b981;
    color: #065f46;
  }
  
  .close-banner {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    padding: 0.25rem;
  }
  
  .tabs {
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    padding: 0 2rem;
    gap: 1rem;
  }
  
  .tab {
    padding: 1rem 1.5rem;
    background-color: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    transition: all 0.2s;
  }
  
  .tab:hover {
    color: #3b82f6;
  }
  
  .tab-active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
  }
  
  .main {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .overview {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .stat-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .stat-icon-blue {
    background-color: #dbeafe;
    color: #3b82f6;
  }
  
  .stat-icon-green {
    background-color: #d1fae5;
    color: #10b981;
  }
  
  .stat-icon-yellow {
    background-color: #fef3c7;
    color: #f59e0b;
  }
  
  .stat-icon-purple {
    background-color: #e9d5ff;
    color: #8b5cf6;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }
  
  .section {
    background-color: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }
  
  .view-all-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    background-color: transparent;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    color: #6b7280;
    transition: all 0.2s;
  }
  
  .view-all-btn:hover {
    background-color: #f9fafb;
    color: #3b82f6;
    border-color: #3b82f6;
  }
  
  .patients-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .patient-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: #f9fafb;
    border-radius: 8px;
    transition: all 0.2s;
  }
  
  .patient-item:hover {
    background-color: #f3f4f6;
  }
  
  .patient-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 600;
  }
  
  .patient-info {
    flex: 1;
  }
  
  .patient-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
  }
  
  .patient-username {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .patient-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .action-btn-small {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.2s;
  }
  
  .action-btn-small:hover {
    background-color: #3b82f6;
    color: white;
    border-color: #3b82f6;
    transform: translateY(-2px);
  }
  
  .patients-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .search-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 0.875rem;
    color: #111827;
  }
  
  .patients-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .patient-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: all 0.2s;
  }
  
  .patient-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
  
  .patient-card-header {
    display: flex;
    gap: 1rem;
  }
  
  .patient-card-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 600;
    flex-shrink: 0;
  }
  
  .patient-card-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .patient-card-name {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }
  
  .patient-card-username {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .patient-card-email, .patient-card-dob {
    font-size: 0.75rem;
    color: #9ca3af;
  }
  
  .patient-card-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .primary-btn {
    flex: 1;
    padding: 0.625rem 1rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }
  
  .primary-btn:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
  }
  
  .secondary-btn {
    flex: 1;
    padding: 0.625rem 1rem;
    background-color: transparent;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }
  
  .secondary-btn:hover {
    background-color: #f9fafb;
    color: #3b82f6;
    border-color: #3b82f6;
  }
  
  .tertiary-btn {
    width: 100%;
    padding: 0.625rem 1rem;
    background-color: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }
  
  .tertiary-btn:hover {
    background-color: #e5e7eb;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .empty-text {
    font-size: 1rem;
    font-weight: 500;
    color: #6b7280;
    margin-top: 1rem;
    margin-bottom: 0.25rem;
  }
  
  .empty-subtext {
    font-size: 0.875rem;
    color: #9ca3af;
    text-align: center;
    max-width: 400px;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }
  
  .modal {
    background-color: white;
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .delete-modal {
    max-width: 450px;
  }

  .delete-warning {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    text-align: center;
  }

  .delete-warning p {
    font-size: 0.875rem;
    color: #374151;
    line-height: 1.5;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .modal-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
  
  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
  }
  
  .close-btn:hover {
    background-color: #f3f4f6;
    color: #111827;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f4f6;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .history-section {
    margin-bottom: 2rem;
  }
  
  .history-section:last-child {
    margin-bottom: 0;
  }
  
  .history-section h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
  }
  
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .history-item {
    padding: 1rem;
    background-color: #f9fafb;
    border-radius: 8px;
    border-left: 3px solid #3b82f6;
  }
  
  .history-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .history-item-header strong {
    font-size: 0.875rem;
    color: #111827;
  }
  
  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .status-active {
    background-color: #d1fae5;
    color: #065f46;
  }
  
  .status-resolved {
    background-color: #dbeafe;
    color: #1e40af;
  }
  
  .severity-badge {
    padding: 0.25rem 0.75rem;
    background-color: #fef3c7;
    color: #92400e;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .delete-icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #ef4444;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .delete-icon-btn:hover {
    background-color: #fee2e2;
    color: #dc2626;
  }
  
  .history-item p {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }
  
  .history-item-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: #9ca3af;
  }
  
  .active-indicator {
    color: #10b981;
    font-weight: 500;
  }
  
  .no-data {
    text-align: center;
    color: #9ca3af;
    font-size: 0.875rem;
    padding: 2rem;
  }
  
  .form-group {
    margin-bottom: 1.25rem;
  }
  
  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #111827;
    transition: all 0.2s;
  }
  
  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
    margin-top: 1.5rem;
  }
  
  .cancel-btn {
    padding: 0.625rem 1.25rem;
    background-color: transparent;
    color: #6b7280;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .cancel-btn:hover {
    background-color: #f9fafb;
  }
  
  .submit-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .submit-btn:hover:not(:disabled) {
    background-color: #2563eb;
  }
  
  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .delete-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .delete-btn:hover:not(:disabled) {
    background-color: #dc2626;
  }

  .delete-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
    
    .header-right {
      width: 100%;
      justify-content: space-between;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .patients-grid {
      grid-template-columns: 1fr;
    }
    
    .form-row {
      grid-template-columns: 1fr;
    }
    
    .modal {
      max-width: 100%;
      margin: 0;
      border-radius: 0;
      max-height: 100vh;
    }
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default DoctorDashboard;