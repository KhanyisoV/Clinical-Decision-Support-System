import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, FileText, Activity, Search, ChevronRight, 
  AlertCircle, LogOut, X, Save, Eye, Stethoscope, ClipboardList, 
  Trash2, Edit, Clock, MapPin, Plus, Pill, Beaker 
} from 'lucide-react';
import { doctorService, symptomService, diagnosisService, appointmentService, prescriptionService, labResultService, clinicalObservationService, allergyService, treatmentService } from '../services/apiService';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [selectedAllergy, setSelectedAllergy] = useState(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    scheduledAppointments: 0,
    activeTreatments: 0
  });
  const [observations, setObservations] = useState([]);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [labResults, setLabResults] = useState([]);
  const [selectedLabResult, setSelectedLabResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({});
  const [patientHistory, setPatientHistory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

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
      await fetchPrescriptions();
      await fetchLabResults();
      await fetchAllergies();
      await fetchTreatments();
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
      await fetchObservations();
      if (patientsResponse.success || patientsResponse.Success) {
        const patientsList = patientsResponse.data || patientsResponse.Data || [];
        setPatients(patientsList);
        
        setStats(prev => ({
          ...prev,
          totalPatients: patientsList.length
        }));
        
      }else {
        setPatients([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Some data could not be loaded');
    }
  };
  const fetchPrescriptions = async () => {
    try {
      const response = await prescriptionService.getAllPrescriptions();
      
      if (response.success || response.Success) {
        const prescriptionsList = response.data || response.Data || [];
        setPrescriptions(prescriptionsList);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    }
  };
  const fetchLabResults = async () => {
    try {
      const response = await labResultService.getAllLabResults();
      
      if (response.success || response.Success) {
        const labResultsList = response.data || response.Data || [];
        setLabResults(labResultsList);
      }
    } catch (err) {
      console.error('Error fetching lab results:', err);
    }
  };
  const fetchObservations = async () => {
    try {
      // Get doctorId from state or localStorage
      const userData = user || JSON.parse(localStorage.getItem('user') || '{}');
      const doctorId = userData?.id || userData?.Id;
      
      console.log('Fetching observations for doctor ID:', doctorId);
      
      if (doctorId) {
        const response = await clinicalObservationService.getObservationsByDoctorId(doctorId);
        
        console.log('Observations response:', response);
        
        if (response.success || response.Success) {
          const observationsList = response.data || response.Data || [];
          setObservations(observationsList);
        }
      } else {
        console.warn('No doctor ID available to fetch observations');
      }
    } catch (err) {
      console.error('Error fetching observations:', err);
    }
  };
  const fetchAllergies = async () => {
    try {
      const response = await allergyService.getAllAllergies();
      
      if (response.success || response.Success) {
        const allergiesList = response.data || response.Data || [];
        setAllergies(allergiesList);
      }
    } catch (err) {
      console.error('Error fetching allergies:', err);
    }
  };
  const fetchTreatments = async () => {
    try {
      const response = await treatmentService.getAllTreatments();
      
      if (response.success || response.Success) {
        const treatmentsList = response.data || response.Data || [];
        
        setTreatments(treatmentsList);
  
        // Count active treatments
        const activeTreatmentsCount = treatmentsList.filter(trt => 
          (trt.status || trt.Status) === 'Active'
        ).length;
  
        // Count treatments starting today (optional)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTreatments = treatmentsList.filter(trt => {
          const startDate = new Date(trt.startDate || trt.StartDate);
          startDate.setHours(0, 0, 0, 0);
          return startDate.getTime() === today.getTime();
        });
  
        setStats(prev => ({
          ...prev,
          activeTreatments: activeTreatmentsCount,
          todayTreatments: todayTreatments.length // optional
        }));
      }
    } catch (err) {
      console.error('Error fetching treatments:', err);
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
        // Count scheduled appointments
        const scheduledCount = doctorAppointments.filter(apt => 
          (apt.status || apt.Status) === 'Scheduled'
        ).length;

        setStats(prev => ({
          ...prev,
          todayAppointments: todayAppointments.length,
          scheduledAppointments: scheduledCount
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
  const handleCreatePrescription = (patient) => {
    setSelectedPatient(patient);
    
    const clientId = patient.id || patient.Id;
    const doctorId = user?.id || user?.Id;
    
    if (!clientId) {
      setError('Cannot create prescription: Patient ID not found');
      return;
    }
    
    if (!doctorId) {
      setError('Cannot create prescription: Doctor ID not found. Please refresh the page.');
      return;
    }
    
    // Set default dates
    const today = new Date();
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14);
    
    setFormData({
      MedicationName: '',
      Dosage: '',
      Frequency: '',
      StartDate: today.toISOString().split('T')[0],
      EndDate: twoWeeksLater.toISOString().split('T')[0],
      Instructions: '',
      Notes: '',
      Status: 'Active',
      ClientId: clientId,
      PrescribedByDoctorId: doctorId
    });
    setShowModal('createPrescription');
  };
  
  const handleEditPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    
    const startDate = new Date(prescription.startDate || prescription.StartDate);
    const endDate = prescription.endDate || prescription.EndDate 
      ? new Date(prescription.endDate || prescription.EndDate) 
      : null;
    
    setFormData({
      MedicationName: prescription.medicationName || prescription.MedicationName || '',
      Dosage: prescription.dosage || prescription.Dosage || '',
      Frequency: prescription.frequency || prescription.Frequency || '',
      StartDate: startDate.toISOString().split('T')[0],
      EndDate: endDate ? endDate.toISOString().split('T')[0] : '',
      Instructions: prescription.instructions || prescription.Instructions || '',
      Notes: prescription.notes || prescription.Notes || '',
      Status: prescription.status || prescription.Status || 'Active',
      IsActive: prescription.isActive ?? prescription.IsActive ?? true,
      ClientId: prescription.clientId || prescription.ClientId,
      PrescribedByDoctorId: prescription.prescribedByDoctorId || prescription.PrescribedByDoctorId
    });
    setShowModal('editPrescription');
  };
  
  const handleDeletePrescription = (prescriptionId) => {
    setDeleteConfirm({
      type: 'prescription',
      id: prescriptionId,
      message: 'Are you sure you want to delete this prescription? This action cannot be undone.'
    });
  };
  
  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await prescriptionService.createPrescription(formData);
      
      if (response.success || response.Success) {
        setSuccess('Prescription created successfully!');
        setShowModal(null);
        setFormData({});
        setSelectedPatient(null);
        await fetchPrescriptions();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || response.Message || 'Failed to create prescription');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating prescription');
      console.error('Prescription submission error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdatePrescription = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const prescriptionId = selectedPrescription.id || selectedPrescription.Id;
      
      const response = await prescriptionService.updatePrescription(prescriptionId, formData);
      
      if (response.success || response.Success) {
        setSuccess('Prescription updated successfully!');
        setShowModal(null);
        setFormData({});
        setSelectedPrescription(null);
        await fetchPrescriptions();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || response.Message || 'Failed to update prescription');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating prescription');
      console.error('Prescription update error:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateLabResult = (patient) => {
    setSelectedPatient(patient);
    
    const clientId = patient.id || patient.Id;
    
    if (!clientId) {
      setError('Cannot create lab result: Patient ID not found');
      return;
    }
    
    setFormData({
      ClientId: clientId,
      TestName: '',
      TestType: '',
      TestDate: new Date().toISOString().split('T')[0],
      Result: '',
      Status: 'Pending',
      Notes: '',
      ReferenceRange: '',
      IsAbnormal: false,
      PerformedBy: ''
    });
    setShowModal('createLabResult');
  };
  const handleCreateObservation = (patient) => {
    setSelectedPatient(patient);
    
    const clientId = patient.id || patient.Id;
    const doctorId = user?.id || user?.Id;
    
    if (!clientId) {
      setError('Cannot create observation: Patient ID not found');
      return;
    }
    
    if (!doctorId) {
      setError('Cannot create observation: Doctor ID not found. Please refresh the page.');
      return;
    }
    
    setFormData({
      Gender: patient.gender || patient.Gender || '',
      Age: 0,
      Height: 0,
      Weight: 0,
      BloodPressure: '',
      HeartRate: 0,
      ObservationType: '',
      Value: '',
      Notes: '',
      ObservationDate: new Date().toISOString().split('T')[0],
      ClientId: clientId,
      RecordedByDoctorId: doctorId
    });
    setShowModal('createObservation');
  };
  
  const handleEditObservation = (observation) => {
    setSelectedObservation(observation);
    
    const obsDate = new Date(observation.observationDate || observation.ObservationDate);
    
    setFormData({
      Gender: observation.gender || observation.Gender || '',
      Age: observation.age || observation.Age || 0,
      Height: observation.height || observation.Height || 0,
      Weight: observation.weight || observation.Weight || 0,
      BloodPressure: observation.bloodPressure || observation.BloodPressure || '',
      HeartRate: observation.heartRate || observation.HeartRate || 0,
      ObservationType: observation.observationType || observation.ObservationType || '',
      Value: observation.value || observation.Value || '',
      Notes: observation.notes || observation.Notes || '',
      ObservationDate: obsDate.toISOString().split('T')[0]
    });
    setShowModal('editObservation');
  };
  
  const handleDeleteObservation = (observationId) => {
    setDeleteConfirm({
      type: 'observation',
      id: observationId,
      message: 'Are you sure you want to delete this clinical observation? This action cannot be undone.'
    });
  };
  
  const handleSubmitObservation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await clinicalObservationService.createObservation(formData);
      
      if (response.success || response.Success) {
        setSuccess('Clinical observation created successfully!');
        setShowModal(null);
        setFormData({});
        setSelectedPatient(null);
        await fetchObservations();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || response.Message || 'Failed to create observation');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating observation');
      console.error('Observation submission error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateObservation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const observationId = selectedObservation.id || selectedObservation.Id;
      
      const response = await clinicalObservationService.updateObservation(observationId, formData);
      
      if (response.success || response.Success) {
        setSuccess('Clinical observation updated successfully!');
        setShowModal(null);
        setFormData({});
        setSelectedObservation(null);
        await fetchObservations();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || response.Message || 'Failed to update observation');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating observation');
      console.error('Observation update error:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateAllergy = (patient) => {
    setSelectedPatient(patient);
    
    const clientId = patient.id || patient.Id;
    
    if (!clientId) {
      setError('Cannot create allergy: Patient ID not found');
      return;
    }
    
    setFormData({
      ClientId: clientId,
      AllergyName: '',
      AllergyType: '',
      Severity: 'Mild',
      Reaction: '',
      Notes: '',
      DiagnosedDate: new Date().toISOString().split('T')[0],
      IsActive: true,
      Treatment: ''
    });
    setShowModal('createAllergy');
  };
  
  const handleEditAllergy = (allergy) => {
    setSelectedAllergy(allergy);
    
    const diagnosedDate = new Date(allergy.diagnosedDate || allergy.DiagnosedDate);
    
    setFormData({
      AllergyName: allergy.allergyName || allergy.AllergyName || '',
      AllergyType: allergy.allergyType || allergy.AllergyType || '',
      Severity: allergy.severity || allergy.Severity || 'Mild',
      Reaction: allergy.reaction || allergy.Reaction || '',
      Notes: allergy.notes || allergy.Notes || '',
      DiagnosedDate: diagnosedDate.toISOString().split('T')[0],
      IsActive: allergy.isActive ?? allergy.IsActive ?? true,
      Treatment: allergy.treatment || allergy.Treatment || ''
    });
    setShowModal('editAllergy');
  };
  
  const handleDeleteAllergy = (allergyId) => {
    setDeleteConfirm({
      type: 'allergy',
      id: allergyId,
      message: 'Are you sure you want to delete this allergy record? This action cannot be undone.'
    });
  };
  
  const handleSubmitAllergy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await allergyService.createAllergy(formData);
      
      if (response.success || response.Success) {
        setSuccess('Allergy record created successfully!');
        setShowModal(null);
        setFormData({});
        setSelectedPatient(null);
        await fetchAllergies();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || response.Message || 'Failed to create allergy');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating allergy');
      console.error('Allergy submission error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateAllergy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const allergyId = selectedAllergy.id || selectedAllergy.Id;
      
      const response = await allergyService.updateAllergy(allergyId, formData);
      
      if (response.success || response.Success) {
        setSuccess('Allergy record updated successfully!');
        setShowModal(null);
        setFormData({});
        setSelectedAllergy(null);
        await fetchAllergies();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || response.Message || 'Failed to update allergy');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating allergy');
      console.error('Allergy update error:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateTreatment = (patient) => {
    setSelectedPatient(patient);
    
    const clientId = patient.id || patient.Id;
    const doctorId = user?.id || user?.Id;
    
    if (!clientId) {
      setError('Cannot create treatment: Patient ID not found');
      return;
    }
    
    if (!doctorId) {
      setError('Cannot create treatment: Doctor ID not found. Please refresh the page.');
      return;
    }
    
    setFormData({
      Title: '',
      Description: '',
      StartDate: new Date().toISOString().split('T')[0],
      EndDate: null, 
      Status: 'Active',
      TreatmentPlan: '',
      Goals: '',
      ProgressNotes: '',
      PrescriptionId: null,  
      NextAppointmentId: null,
      DiagnosisId: null,
      ClientId: clientId,
      ProvidedByDoctorId: doctorId
    });
    setShowModal('createTreatment');
  };
  
  const handleEditTreatment = (treatment) => {
    setSelectedTreatment(treatment);
    
    const startDate = new Date(treatment.startDate || treatment.StartDate);
    const endDate = treatment.endDate || treatment.EndDate 
      ? new Date(treatment.endDate || treatment.EndDate) 
      : null;
    
    setFormData({
      Title: treatment.title || treatment.Title || '',
      Description: treatment.description || treatment.Description || '',
      StartDate: startDate.toISOString().split('T')[0],
      EndDate: endDate ? endDate.toISOString().split('T')[0] : '',
      Status: treatment.status || treatment.Status || 'Active',
      TreatmentPlan: treatment.treatmentPlan || treatment.TreatmentPlan || '',
      Goals: treatment.goals || treatment.Goals || '',
      ProgressNotes: treatment.progressNotes || treatment.ProgressNotes || ''
    });
    setShowModal('editTreatment');
  };
  
  const handleDeleteTreatment = (treatmentId) => {
    setDeleteConfirm({
      type: 'treatment',
      id: treatmentId,
      message: 'Are you sure you want to delete this treatment plan? This action cannot be undone.'
    });
  };
  
  const handleSubmitTreatment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {

      console.log('Sending treatment data:', formData);

      const response = await treatmentService.createTreatment(formData);
      
      if (response.success || response.Success) {
        setSuccess('Treatment created successfully!');
        setShowModal(null);
        setFormData({});
        setSelectedPatient(null);
        await fetchTreatments();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || response.Message || 'Failed to create treatment');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating treatment');
      console.error('Treatment submission error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateTreatment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const treatmentId = selectedTreatment.id || selectedTreatment.Id;
      
      const response = await treatmentService.updateTreatment(treatmentId, formData);
      
      if (response.success || response.Success) {
        setSuccess('Treatment updated successfully!');
        setShowModal(null);
        setFormData({});
        setSelectedTreatment(null);
        await fetchTreatments();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || response.Message || 'Failed to update treatment');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating treatment');
      console.error('Treatment update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLabResult = (labResult) => {
    setSelectedLabResult(labResult);
    
    const testDate = new Date(labResult.testDate || labResult.TestDate);
    
    setFormData({
      TestName: labResult.testName || labResult.TestName || '',
      TestType: labResult.testType || labResult.TestType || '',
      TestDate: testDate.toISOString().split('T')[0],
      Result: labResult.result || labResult.Result || '',
      Status: labResult.status || labResult.Status || 'Pending',
      Notes: labResult.notes || labResult.Notes || '',
      ReferenceRange: labResult.referenceRange || labResult.ReferenceRange || '',
      IsAbnormal: labResult.isAbnormal ?? labResult.IsAbnormal ?? false,
      PerformedBy: labResult.performedBy || labResult.PerformedBy || ''
    });
    setShowModal('editLabResult');
  };
  
  const handleDeleteLabResult = (labResultId) => {
    setDeleteConfirm({
      type: 'labresult',
      id: labResultId,
      message: 'Are you sure you want to delete this lab result? This action cannot be undone.'
    });
  };
  
  const handleSubmitLabResult = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
     
      const response = await labResultService.createLabResult(formData);
      
      if (response.success || response.Success) {
        setSuccess('Lab result created successfully!');
        setShowModal(null);
        setFormData({});
        setSelectedPatient(null);
        await fetchLabResults();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || response.Message || 'Failed to create lab result');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating lab result');
      console.error('Lab result submission error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateLabResult = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const labResultId = selectedLabResult.id || selectedLabResult.Id;
      
      const response = await labResultService.updateLabResult(labResultId, formData);
      
      if (response.success || response.Success) {
        setSuccess('Lab result updated successfully!');
        setShowModal(null);
        setFormData({});
        setSelectedLabResult(null);
        await fetchLabResults();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || response.Message || 'Failed to update lab result');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating lab result');
      console.error('Lab result update error:', err);
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
      const clientId = patient.id || patient.Id;
      
      const diagnosesRes = await diagnosisService.getDiagnosesByClientUsername(patient.userName);
      const symptomsRes = await symptomService.getSymptomsByClientUsername(patient.userName);
      const prescriptionsRes = await prescriptionService.getActivePrescriptionsByClientId(clientId);
      const labResultsRes = await labResultService.getLabResultsByClientId(clientId);
      const observationsRes = await clinicalObservationService.getObservationsByClientId(clientId);
      const allergiesRes = await allergyService.getAllergiesByClientId(clientId);

      const allergies = (allergiesRes.success || allergiesRes.Success)
        ? (allergiesRes.data || allergiesRes.Data || [])
        : [];

      const diagnoses = (diagnosesRes.success || diagnosesRes.Success)
        ? (diagnosesRes.data || diagnosesRes.Data || [])
        : [];

      const symptoms = (symptomsRes.success || symptomsRes.Success)
        ? (symptomsRes.data || symptomsRes.Data || [])
        : [];

      const prescriptions = (prescriptionsRes.success || prescriptionsRes.Success)
        ? (prescriptionsRes.data || prescriptionsRes.Data || [])
        : [];

      const labResults = (labResultsRes.success || labResultsRes.Success)
        ? (labResultsRes.data || labResultsRes.Data || [])
        : [];


      const observations = (observationsRes.success || observationsRes.Success)
        ? (observationsRes.data || observationsRes.Data || [])
        : [];

      setPatientHistory({
        diagnoses,
        symptoms,
        prescriptions,
        labResults,
        observations,
        allergies 
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
      } else if (deleteConfirm.type === 'prescription') {
        response = await prescriptionService.deletePrescription(deleteConfirm.id);
      } else if (deleteConfirm.type === 'labresult') {
        response = await labResultService.deleteLabResult(deleteConfirm.id);
      } else if (deleteConfirm.type === 'observation') {
        response = await clinicalObservationService.deleteObservation(deleteConfirm.id);
      } else if (deleteConfirm.type === 'allergy') {
        response = await allergyService.deleteAllergy(deleteConfirm.id);
      }else if (deleteConfirm.type === 'treatment') {
        response = await treatmentService.deleteTreatment(deleteConfirm.id);
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
        
        // Refresh prescriptions if prescription was deleted
        if (deleteConfirm.type === 'prescription') {
          await fetchPrescriptions();
        }

        // Refresh treatments if treatment was deleted
        if (deleteConfirm.type === 'treatment') {
          await fetchTreatments();
        }

        // Refresh observations if observation was deleted
        if (deleteConfirm.type === 'observation') {
          await fetchObservations();
        }

        // Refresh allergies if allergy was deleted
        if (deleteConfirm.type === 'allergy') {
          await fetchAllergies();
        }

        // Refresh lab results if lab result was deleted
        if (deleteConfirm.type === 'labresult') {
          await fetchLabResults();
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
          className={activeTab === 'treatments' ? 'tab tab-active' : 'tab'}
          onClick={() => setActiveTab('treatments')}
        >
          Treatment Plans ({treatments.length})
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
        <button
          className={activeTab === 'prescriptions' ? 'tab tab-active' : 'tab'}
          onClick={() => setActiveTab('prescriptions')}
        >
          Prescriptions ({prescriptions.length})
        </button>
        <button
          className={activeTab === 'labresults' ? 'tab tab-active' : 'tab'}
          onClick={() => setActiveTab('labresults')}
        >
          Lab Results ({labResults.length})
        </button>
        <button
          className={activeTab === 'observations' ? 'tab tab-active' : 'tab'}
          onClick={() => setActiveTab('observations')}
        >
          Clinical Observations ({observations.length})
        </button>
        <button
          className={activeTab === 'allergies' ? 'tab tab-active' : 'tab'}
          onClick={() => setActiveTab('allergies')}
        >
          Allergies ({allergies.length})
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
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats.scheduledAppointments}</div>
                  <div className="stat-label">Scheduled Appointments</div>
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
                        onClick={() => handleCreateLabResult(patient)}
                        title="Add Lab Result"
                      >
                        <Beaker size={16} />
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
                      <button 
                        className="action-btn-small"
                        onClick={() => handleCreatePrescription(patient)}
                        title="New Prescription"
                      >
                        <Pill size={16} />
                      </button>
                      <button 
                        className="action-btn-small"
                        onClick={() => handleCreateObservation(patient)}
                        title="Record Observation"
                      >
                        <Activity size={16} />
                      </button>

                      <button 
                        className="action-btn-small"
                        onClick={() => handleCreateAllergy(patient)}
                        title="Add Allergy"
                      >
                        <AlertCircle size={16} />
                      </button>

                      <button 
                        className="action-btn-small"
                        onClick={() => handleCreateTreatment(patient)}
                        title="Create Treatment Plan"
                      >
                        <FileText size={16} />
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

                  <button 
                    className="tertiary-btn"
                    onClick={() => handleCreateTreatment(patient)}
                    style={{marginTop: '0.5rem'}}
                  >
                    <FileText size={16} />
                    Create Treatment Plan
                  </button>

                  <button 
                    className="tertiary-btn"
                    onClick={() => handleCreateObservation(patient)}
                    style={{marginTop: '0.5rem'}}
                  >
                    <ClipboardList size={16} />
                    Record Observation
                  </button>

                  <button 
                    className="tertiary-btn"
                    onClick={() => handleCreatePrescription(patient)}
                    style={{marginTop: '0.5rem'}}
                  >
                    <Pill size={16} />
                    New Prescription
                  </button>
                  <button 
                    className="tertiary-btn"
                    onClick={() => handleCreateLabResult(patient)}
                    style={{marginTop: '0.5rem'}}
                  >
                    <Beaker size={16} />
                    Add Lab Result
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
        {activeTab === 'prescriptions' && (
          <div className="prescriptions-view">
            <div className="section-header" style={{marginBottom: '1.5rem'}}>
              <h2 className="section-title">Prescription History</h2>
            </div>

            {prescriptions.length === 0 ? (
              <div className="empty-state">
                <Pill size={64} color="#9ca3af" />
                <p className="empty-text">No prescriptions created yet</p>
                <p className="empty-subtext">Create prescriptions for your patients from the Patients tab</p>
              </div>
            ) : (
              <div className="prescriptions-grid">
                {prescriptions
                  .sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.CreatedAt);
                    const dateB = new Date(b.createdAt || b.CreatedAt);
                    return dateB - dateA;
                  })
                  .map((prescription, index) => {
                    const startDate = new Date(prescription.startDate || prescription.StartDate);
                    const endDate = prescription.endDate || prescription.EndDate 
                      ? new Date(prescription.endDate || prescription.EndDate) 
                      : null;
                    const isActive = prescription.isActive ?? prescription.IsActive ?? true;
                    const status = prescription.status || prescription.Status;
                    
                    const client = prescription.client || prescription.Client;
                    const clientName = client 
                      ? `${client.firstName || client.FirstName} ${client.lastName || client.LastName}`
                      : 'Unknown Patient';
                    
                    return (
                      <div key={index} className="prescription-card">
                        <div className="prescription-card-header">
                          <div>
                            <div className="prescription-card-title">
                              {prescription.medicationName || prescription.MedicationName}
                            </div>
                            <div className="prescription-card-patient">
                              <Users size={14} />
                              {clientName}
                            </div>
                          </div>
                          <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                            <span className={`status-badge status-${status.toLowerCase()}`}>
                              {status}
                            </span>
                            {isActive && (
                              <span className="active-badge">
                                Active
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="prescription-card-body">
                          <div className="prescription-card-dosage">
                            <strong>Dosage:</strong>
                            <span>{prescription.dosage || prescription.Dosage}</span>
                          </div>

                          <div className="prescription-card-frequency">
                            <strong>Frequency:</strong>
                            <span>{prescription.frequency || prescription.Frequency}</span>
                          </div>

                          <div className="prescription-card-dates">
                            <div className="date-item">
                              <Clock size={14} />
                              <span>Start: {startDate.toLocaleDateString()}</span>
                            </div>
                            {endDate && (
                              <div className="date-item">
                                <Clock size={14} />
                                <span>End: {endDate.toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {(prescription.instructions || prescription.Instructions) && (
                            <div className="prescription-card-instructions">
                              <strong>Instructions:</strong>
                              <p>{prescription.instructions || prescription.Instructions}</p>
                            </div>
                          )}

                          {(prescription.notes || prescription.Notes) && (
                            <div className="prescription-card-notes">
                              <strong>Notes:</strong>
                              <p>{prescription.notes || prescription.Notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="prescription-card-footer">
                          <div className="prescription-card-meta">
                            <span>Created: {new Date(prescription.createdAt || prescription.CreatedAt).toLocaleDateString()}</span>
                            {(prescription.updatedAt || prescription.UpdatedAt) && (
                              <span>Updated: {new Date(prescription.updatedAt || prescription.UpdatedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                          <div className="prescription-card-actions">
                            <button 
                              className="secondary-btn"
                              onClick={() => handleEditPrescription(prescription)}
                            >
                              <Edit size={16} />
                              Edit
                            </button>
                            <button 
                              className="delete-btn-small"
                              onClick={() => handleDeletePrescription(prescription.id || prescription.Id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
        {activeTab === 'labresults' && (
          <div className="labresults-view">
            <div className="section-header" style={{marginBottom: '1.5rem'}}>
              <h2 className="section-title">Lab Results History</h2>
            </div>

            {labResults.length === 0 ? (
              <div className="empty-state">
                <Beaker size={64} color="#9ca3af" />
                <p className="empty-text">No lab results recorded yet</p>
                <p className="empty-subtext">Add lab results for your patients from the Patients tab</p>
              </div>
            ) : (
              <div className="labresults-grid">
                {labResults
                  .sort((a, b) => {
                    const dateA = new Date(a.testDate || a.TestDate);
                    const dateB = new Date(b.testDate || b.TestDate);
                    return dateB - dateA;
                  })
                  .map((labResult, index) => {
                    const testDate = new Date(labResult.testDate || labResult.TestDate);
                    const isAbnormal = labResult.isAbnormal ?? labResult.IsAbnormal ?? false;
                    const status = labResult.status || labResult.Status;
                    
                    const clientName = labResult.clientName || labResult.ClientName || 'Unknown Patient';
                    
                    return (
                      <div key={index} className={`labresult-card ${isAbnormal ? 'abnormal' : ''}`}>
                        <div className="labresult-card-header">
                          <div>
                            <div className="labresult-card-title">
                              {labResult.testName || labResult.TestName}
                            </div>
                            <div className="labresult-card-patient">
                              <Users size={14} />
                              {clientName}
                            </div>
                          </div>
                          <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap'}}>
                            <span className={`status-badge status-${status.toLowerCase()}`}>
                              {status}
                            </span>
                            {isAbnormal && (
                              <span className="abnormal-badge">
                                Abnormal
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="labresult-card-body">
                          <div className="labresult-card-type">
                            <strong>Test Type:</strong>
                            <span>{labResult.testType || labResult.TestType}</span>
                          </div>

                          <div className="labresult-card-result">
                            <strong>Result:</strong>
                            <span className={isAbnormal ? 'abnormal-result' : ''}>
                              {labResult.result || labResult.Result}
                            </span>
                          </div>

                          {(labResult.referenceRange || labResult.ReferenceRange) && (
                            <div className="labresult-card-reference">
                              <strong>Reference Range:</strong>
                              <span>{labResult.referenceRange || labResult.ReferenceRange}</span>
                            </div>
                          )}

                          <div className="labresult-card-date">
                            <Clock size={14} />
                            <span>Test Date: {testDate.toLocaleDateString()}</span>
                          </div>

                          {(labResult.performedBy || labResult.PerformedBy) && (
                            <div className="labresult-card-performed">
                              <strong>Performed By:</strong>
                              <span>{labResult.performedBy || labResult.PerformedBy}</span>
                            </div>
                          )}

                          {(labResult.notes || labResult.Notes) && (
                            <div className="labresult-card-notes">
                              <strong>Notes:</strong>
                              <p>{labResult.notes || labResult.Notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="labresult-card-footer">
                          <div className="labresult-card-meta">
                            <span>Created: {new Date(labResult.createdAt || labResult.CreatedAt).toLocaleDateString()}</span>
                            {(labResult.updatedAt || labResult.UpdatedAt) && (
                              <span>Updated: {new Date(labResult.updatedAt || labResult.UpdatedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                          <div className="labresult-card-actions">
                            <button 
                              className="secondary-btn"
                              onClick={() => handleEditLabResult(labResult)}
                            >
                              <Edit size={16} />
                              Edit
                            </button>
                            <button 
                              className="delete-btn-small"
                              onClick={() => handleDeleteLabResult(labResult.id || labResult.Id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                    
                  })}
              </div>
            )}
          </div>
        )}

{activeTab === 'observations' && (
  <div className="observations-view">
    <div className="section-header" style={{marginBottom: '1.5rem'}}>
      <h2 className="section-title">Clinical Observations History</h2>
    </div>

    {observations.length === 0 ? (
      <div className="empty-state">
        <ClipboardList size={64} color="#9ca3af" />
        <p className="empty-text">No clinical observations recorded yet</p>
        <p className="empty-subtext">Record clinical observations for your patients from the Patients tab</p>
      </div>
    ) : (
      <div className="observations-grid">
        {observations
          .sort((a, b) => {
            const dateA = new Date(a.observationDate || a.ObservationDate);
            const dateB = new Date(b.observationDate || b.ObservationDate);
            return dateB - dateA;
          })
          .map((observation, index) => {
            const obsDate = new Date(observation.observationDate || observation.ObservationDate);
            
            const clientName = observation.client?.firstName || observation.Client?.FirstName 
              ? `${observation.client?.firstName || observation.Client?.FirstName} ${observation.client?.lastName || observation.Client?.LastName}`
              : 'Unknown Patient';
            
            const bmi = observation.height && observation.weight 
              ? (observation.weight / Math.pow(observation.height / 100, 2)).toFixed(1)
              : null;
            
            return (
              <div key={index} className="observation-card">
                <div className="observation-card-header">
                  <div>
                    <div className="observation-card-title">
                      Clinical Observation
                    </div>
                    <div className="observation-card-patient">
                      <Users size={14} />
                      {clientName}
                    </div>
                  </div>
                  <div className="observation-card-date">
                    <Clock size={14} />
                    {obsDate.toLocaleDateString()}
                  </div>
                </div>

                <div className="observation-card-body">
                  <div className="observation-vitals-grid">
                    {observation.gender && (
                      <div className="vital-item">
                        <strong>Gender:</strong>
                        <span>{observation.gender || observation.Gender}</span>
                      </div>
                    )}
                    
                    {observation.age && (
                      <div className="vital-item">
                        <strong>Age:</strong>
                        <span>{observation.age || observation.Age} years</span>
                      </div>
                    )}
                    
                    {observation.height && (
                      <div className="vital-item">
                        <strong>Height:</strong>
                        <span>{observation.height || observation.Height} cm</span>
                      </div>
                    )}
                    
                    {observation.weight && (
                      <div className="vital-item">
                        <strong>Weight:</strong>
                        <span>{observation.weight || observation.Weight} kg</span>
                      </div>
                    )}
                    
                    {bmi && (
                      <div className="vital-item">
                        <strong>BMI:</strong>
                        <span className={bmi < 18.5 || bmi > 25 ? 'abnormal-result' : ''}>{bmi}</span>
                      </div>
                    )}
                    
                    {observation.bloodPressure && (
                      <div className="vital-item">
                        <strong>Blood Pressure:</strong>
                        <span>{observation.bloodPressure || observation.BloodPressure}</span>
                      </div>
                    )}
                    
                    {observation.heartRate && (
                      <div className="vital-item">
                        <strong>Heart Rate:</strong>
                        <span>{observation.heartRate || observation.HeartRate} bpm</span>
                      </div>
                    )}
                  </div>

                  {(observation.observationType || observation.ObservationType) && (
                    <div className="observation-type-section">
                      <strong>Observation Type:</strong>
                      <span>{observation.observationType || observation.ObservationType}</span>
                      {(observation.value || observation.Value) && (
                        <span className="observation-value"> - {observation.value || observation.Value}</span>
                      )}
                    </div>
                  )}

                  {(observation.notes || observation.Notes) && (
                    <div className="observation-card-notes">
                      <strong>Notes:</strong>
                      <p>{observation.notes || observation.Notes}</p>
                    </div>
                  )}
                </div>

                <div className="observation-card-footer">
                  <div className="observation-card-meta">
                    <span>Recorded: {new Date(observation.createdAt || observation.CreatedAt).toLocaleDateString()}</span>
                    {(observation.updatedAt || observation.UpdatedAt) && (
                      <span>Updated: {new Date(observation.updatedAt || observation.UpdatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="observation-card-actions">
                    <button 
                      className="secondary-btn"
                      onClick={() => handleEditObservation(observation)}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button 
                      className="delete-btn-small"
                      onClick={() => handleDeleteObservation(observation.id || observation.Id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    )}
  </div>
)}

{activeTab === 'allergies' && (
  <div className="allergies-view">
    <div className="section-header" style={{marginBottom: '1.5rem'}}>
      <h2 className="section-title">Allergy Records</h2>
    </div>

    {allergies.length === 0 ? (
      <div className="empty-state">
        <AlertCircle size={64} color="#9ca3af" />
        <p className="empty-text">No allergy records found</p>
        <p className="empty-subtext">Add allergy records for your patients from the Patients tab</p>
      </div>
    ) : (
      <div className="allergies-grid">
        {allergies
          .sort((a, b) => {
            const dateA = new Date(a.diagnosedDate || a.DiagnosedDate);
            const dateB = new Date(b.diagnosedDate || b.DiagnosedDate);
            return dateB - dateA;
          })
          .map((allergy, index) => {
            const diagnosedDate = new Date(allergy.diagnosedDate || allergy.DiagnosedDate);
            const isActive = allergy.isActive ?? allergy.IsActive ?? true;
            const severity = allergy.severity || allergy.Severity;
            
            const clientName = allergy.clientName || allergy.ClientName || 'Unknown Patient';
            
            // Determine severity color
            const getSeverityColor = (sev) => {
              const sevLower = sev?.toLowerCase();
              if (sevLower === 'severe' || sevLower === 'life-threatening') return '#dc2626';
              if (sevLower === 'moderate') return '#f59e0b';
              return '#10b981';
            };
            
            return (
              <div key={index} className={`allergy-card ${!isActive ? 'inactive' : ''}`} style={{borderLeftColor: getSeverityColor(severity)}}>
                <div className="allergy-card-header">
                  <div>
                    <div className="allergy-card-title">
                      {allergy.allergyName || allergy.AllergyName}
                    </div>
                    <div className="allergy-card-patient">
                      <Users size={14} />
                      {clientName}
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap'}}>
                    <span className={`severity-badge severity-${severity?.toLowerCase()}`}>
                      {severity}
                    </span>
                    {isActive && (
                      <span className="active-badge">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                <div className="allergy-card-body">
                  {(allergy.allergyType || allergy.AllergyType) && (
                    <div className="allergy-card-type">
                      <strong>Type:</strong>
                      <span>{allergy.allergyType || allergy.AllergyType}</span>
                    </div>
                  )}

                  {(allergy.reaction || allergy.Reaction) && (
                    <div className="allergy-card-reaction">
                      <strong>Reaction:</strong>
                      <p>{allergy.reaction || allergy.Reaction}</p>
                    </div>
                  )}

                  {(allergy.treatment || allergy.Treatment) && (
                    <div className="allergy-card-treatment">
                      <strong>Treatment:</strong>
                      <p>{allergy.treatment || allergy.Treatment}</p>
                    </div>
                  )}

                  <div className="allergy-card-date">
                    <Clock size={14} />
                    <span>Diagnosed: {diagnosedDate.toLocaleDateString()}</span>
                  </div>

                  {(allergy.notes || allergy.Notes) && (
                    <div className="allergy-card-notes">
                      <strong>Notes:</strong>
                      <p>{allergy.notes || allergy.Notes}</p>
                    </div>
                  )}
                </div>

                <div className="allergy-card-footer">
                  <div className="allergy-card-meta">
                    <span>Added by: {allergy.createdByRole || allergy.CreatedByRole}</span>
                    <span>Created: {new Date(allergy.createdAt || allergy.CreatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="allergy-card-actions">
                    <button 
                      className="secondary-btn"
                      onClick={() => handleEditAllergy(allergy)}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button 
                      className="delete-btn-small"
                      onClick={() => handleDeleteAllergy(allergy.id || allergy.Id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    )}
  </div>
)}
{activeTab === 'treatments' && (
  <div className="treatments-view">
    <div className="section-header" style={{marginBottom: '1.5rem'}}>
      <h2 className="section-title">Treatment Plans</h2>
    </div>

    {treatments.length === 0 ? (
      <div className="empty-state">
        <FileText size={64} color="#9ca3af" />
        <p className="empty-text">No treatment plans created yet</p>
        <p className="empty-subtext">Create treatment plans for your patients from the Patients tab</p>
      </div>
    ) : (
      <div className="treatments-grid">
        {treatments
          .sort((a, b) => {
            const dateA = new Date(a.startDate || a.StartDate);
            const dateB = new Date(b.startDate || b.StartDate);
            return dateB - dateA;
          })
          .map((treatment, index) => {
            const startDate = new Date(treatment.startDate || treatment.StartDate);
            const endDate = treatment.endDate || treatment.EndDate 
              ? new Date(treatment.endDate || treatment.EndDate) 
              : null;
            const status = treatment.status || treatment.Status;
            
            const client = treatment.client || treatment.Client;
            const clientName = client 
              ? `${client.firstName || client.FirstName} ${client.lastName || client.LastName}`
              : 'Unknown Patient';
            
            const doctor = treatment.providedByDoctor || treatment.ProvidedByDoctor;
            const doctorName = doctor 
              ? `Dr. ${doctor.firstName || doctor.FirstName} ${doctor.lastName || doctor.LastName}`
              : 'Unknown Doctor';
            
            return (
              <div key={index} className="treatment-card">
                <div className="treatment-card-header">
                  <div>
                    <div className="treatment-card-title">
                      {treatment.title || treatment.Title}
                    </div>
                    <div className="treatment-card-patient">
                      <Users size={14} />
                      {clientName}
                    </div>
                  </div>
                  <span className={`status-badge status-${status.toLowerCase()}`}>
                    {status}
                  </span>
                </div>

                <div className="treatment-card-body">
                  {(treatment.description || treatment.Description) && (
                    <p className="treatment-card-description">
                      {treatment.description || treatment.Description}
                    </p>
                  )}

                  <div className="treatment-card-dates">
                    <div className="date-item">
                      <Clock size={14} />
                      <span>Start: {startDate.toLocaleDateString()}</span>
                    </div>
                    {endDate && (
                      <div className="date-item">
                        <Clock size={14} />
                        <span>End: {endDate.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {(treatment.treatmentPlan || treatment.TreatmentPlan) && (
                    <div className="treatment-card-plan">
                      <strong>Treatment Plan:</strong>
                      <p>{treatment.treatmentPlan || treatment.TreatmentPlan}</p>
                    </div>
                  )}

                  {(treatment.goals || treatment.Goals) && (
                    <div className="treatment-card-goals">
                      <strong>Goals:</strong>
                      <p>{treatment.goals || treatment.Goals}</p>
                    </div>
                  )}

                  {(treatment.progressNotes || treatment.ProgressNotes) && (
                    <div className="treatment-card-progress">
                      <strong>Progress Notes:</strong>
                      <p>{treatment.progressNotes || treatment.ProgressNotes}</p>
                    </div>
                  )}
                </div>

                <div className="treatment-card-footer">
                  <div className="treatment-card-meta">
                    <span>Doctor: {doctorName}</span>
                    <span>Created: {new Date(treatment.createdAt || treatment.CreatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="treatment-card-actions">
                    <button 
                      className="secondary-btn"
                      onClick={() => handleEditTreatment(treatment)}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button 
                      className="delete-btn-small"
                      onClick={() => handleDeleteTreatment(treatment.id || treatment.Id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    )}
  </div>
)}

      </main>
{/* Create Lab Result Modal */}
{showModal === 'createLabResult' && selectedPatient && (
                      <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                          <div className="modal-header">
                            <h2>New Lab Result for {selectedPatient.firstName} {selectedPatient.lastName}</h2>
                            <button onClick={closeModal} className="close-btn">
                              <X size={24} />
                            </button>
                          </div>
                          <form onSubmit={handleSubmitLabResult} className="modal-body">
                            <div className="form-group">
                              <label>Test Name *</label>
                              <input
                                type="text"
                                required
                                value={formData.TestName || ''}
                                onChange={(e) => setFormData({...formData, TestName: e.target.value})}
                                placeholder="e.g., Complete Blood Count"
                              />
                            </div>
                    
                            <div className="form-row">
                              <div className="form-group">
                                <label>Test Type *</label>
                                <input
                                  type="text"
                                  required
                                  value={formData.TestType || ''}
                                  onChange={(e) => setFormData({...formData, TestType: e.target.value})}
                                  placeholder="e.g., Blood Test"
                                />
                              </div>
                    
                              <div className="form-group">
                                <label>Test Date *</label>
                                <input
                                  type="date"
                                  required
                                  value={formData.TestDate || ''}
                                  onChange={(e) => setFormData({...formData, TestDate: e.target.value})}
                                />
                              </div>
                            </div>
                    
                            <div className="form-row">
                              <div className="form-group">
                                <label>Result *</label>
                                <input
                                  type="text"
                                  required
                                  value={formData.Result || ''}
                                  onChange={(e) => setFormData({...formData, Result: e.target.value})}
                                  placeholder="e.g., 150 mg/dL"
                                />
                              </div>
                    
                              <div className="form-group">
                                <label>Status *</label>
                                <select
                                  required
                                  value={formData.Status || 'Pending'}
                                  onChange={(e) => setFormData({...formData, Status: e.target.value})}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>
                    
                            <div className="form-row">
                              <div className="form-group">
                                <label>Reference Range</label>
                                <input
                                  type="text"
                                  value={formData.ReferenceRange || ''}
                                  onChange={(e) => setFormData({...formData, ReferenceRange: e.target.value})}
                                  placeholder="e.g., 70-100 mg/dL"
                                />
                              </div>
                    
                              <div className="form-group">
                                <label>Performed By</label>
                                <input
                                  type="text"
                                  value={formData.PerformedBy || ''}
                                  onChange={(e) => setFormData({...formData, PerformedBy: e.target.value})}
                                  placeholder="Lab technician name"
                                />
                              </div>
                            </div>
                    
                            <div className="form-group">
                              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                <input
                                  type="checkbox"
                                  checked={formData.IsAbnormal || false}
                                  onChange={(e) => setFormData({...formData, IsAbnormal: e.target.checked})}
                                  style={{width: 'auto'}}
                                />
                                Mark as Abnormal
                              </label>
                            </div>
                    
                            <div className="form-group">
                              <label>Notes</label>
                              <textarea
                                rows="3"
                                value={formData.Notes || ''}
                                onChange={(e) => setFormData({...formData, Notes: e.target.value})}
                                placeholder="Additional notes or observations"
                              />
                            </div>
                    
                            <div className="modal-footer">
                              <button type="button" onClick={closeModal} className="cancel-btn">
                                Cancel
                              </button>
                              <button type="submit" className="submit-btn" disabled={loading}>
                                <Save size={18} />
                                {loading ? 'Creating...' : 'Create Lab Result'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                    
{/* Edit Lab Result Modal */}
{showModal === 'editLabResult' && selectedLabResult && (
                      <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                          <div className="modal-header">
                            <h2>Edit Lab Result</h2>
                            <button onClick={closeModal} className="close-btn">
                              <X size={24} />
                            </button>
                          </div>
                          <form onSubmit={handleUpdateLabResult} className="modal-body">
                            <div className="form-group">
                              <label>Test Name *</label>
                              <input
                                type="text"
                                required
                                value={formData.TestName || ''}
                                onChange={(e) => setFormData({...formData, TestName: e.target.value})}
                                placeholder="e.g., Complete Blood Count"
                              />
                            </div>
                    
                            <div className="form-row">
                              <div className="form-group">
                                <label>Test Type *</label>
                                <input
                                  type="text"
                                  required
                                  value={formData.TestType || ''}
                                  onChange={(e) => setFormData({...formData, TestType: e.target.value})}
                                  placeholder="e.g., Blood Test"
                                />
                              </div>
                    
                              <div className="form-group">
                                <label>Test Date *</label>
                                <input
                                  type="date"
                                  required
                                  value={formData.TestDate || ''}
                                  onChange={(e) => setFormData({...formData, TestDate: e.target.value})}
                                />
                              </div>
                            </div>
                    
                            <div className="form-row">
                              <div className="form-group">
                                <label>Result *</label>
                                <input
                                  type="text"
                                  required
                                  value={formData.Result || ''}
                                  onChange={(e) => setFormData({...formData, Result: e.target.value})}
                                  placeholder="e.g., 150 mg/dL"
                                />
                              </div>
                    
                              <div className="form-group">
                                <label>Status *</label>
                                <select
                                  required
                                  value={formData.Status || 'Pending'}
                                  onChange={(e) => setFormData({...formData, Status: e.target.value})}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>
                    
                            <div className="form-row">
                              <div className="form-group">
                                <label>Reference Range</label>
                                <input
                                  type="text"
                                  value={formData.ReferenceRange || ''}
                                  onChange={(e) => setFormData({...formData, ReferenceRange: e.target.value})}
                                  placeholder="e.g., 70-100 mg/dL"
                                />
                              </div>
                    
                              <div className="form-group">
                                <label>Performed By</label>
                                <input
                                  type="text"
                                  value={formData.PerformedBy || ''}
                                  onChange={(e) => setFormData({...formData, PerformedBy: e.target.value})}
                                  placeholder="Lab technician name"
                                />
                              </div>
                            </div>
                    
                            <div className="form-group">
                              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                <input
                                  type="checkbox"
                                  checked={formData.IsAbnormal || false}
                                  onChange={(e) => setFormData({...formData, IsAbnormal: e.target.checked})}
                                  style={{width: 'auto'}}
                                />
                                Mark as Abnormal
                              </label>
                            </div>
                    
                            <div className="form-group">
                              <label>Notes</label>
                              <textarea
                                rows="3"
                                value={formData.Notes || ''}
                                onChange={(e) => setFormData({...formData, Notes: e.target.value})}
                                placeholder="Additional notes or observations"
                              />
                            </div>
                    
                            <div className="modal-footer">
                              <button type="button" onClick={closeModal} className="cancel-btn">
                                Cancel
                              </button>
                              <button type="submit" className="submit-btn" disabled={loading}>
                                <Save size={18} />
                                {loading ? 'Updating...' : 'Update Lab Result'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>)}

{/* Create Clinical Observation Modal */}
{showModal === 'createObservation' && selectedPatient && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Clinical Observation for {selectedPatient.firstName} {selectedPatient.lastName}</h2>
        <button onClick={closeModal} className="close-btn">
          <X size={24} />
        </button>
      </div>
      <form onSubmit={handleSubmitObservation} className="modal-body">
        <div className="form-row">
          <div className="form-group">
            <label>Gender *</label>
            <select
              required
              value={formData.Gender || ''}
              onChange={(e) => setFormData({...formData, Gender: e.target.value})}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Age *</label>
            <input
              type="number"
              required
              min="0"
              max="150"
              value={formData.Age || ''}
              onChange={(e) => setFormData({...formData, Age: parseInt(e.target.value)})}
              placeholder="Age in years"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Height (cm) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.1"
              value={formData.Height || ''}
              onChange={(e) => setFormData({...formData, Height: parseFloat(e.target.value)})}
              placeholder="e.g., 170"
            />
          </div>

          <div className="form-group">
            <label>Weight (kg) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.1"
              value={formData.Weight || ''}
              onChange={(e) => setFormData({...formData, Weight: parseFloat(e.target.value)})}
              placeholder="e.g., 70"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Blood Pressure</label>
            <input
              type="text"
              value={formData.BloodPressure || ''}
              onChange={(e) => setFormData({...formData, BloodPressure: e.target.value})}
              placeholder="e.g., 120/80"
            />
          </div>

          <div className="form-group">
            <label>Heart Rate (bpm)</label>
            <input
              type="number"
              min="0"
              value={formData.HeartRate || ''}
              onChange={(e) => setFormData({...formData, HeartRate: parseInt(e.target.value)})}
              placeholder="e.g., 72"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Observation Type</label>
            <input
              type="text"
              value={formData.ObservationType || ''}
              onChange={(e) => setFormData({...formData, ObservationType: e.target.value})}
              placeholder="e.g., Physical Examination"
            />
          </div>

          <div className="form-group">
            <label>Observation Date *</label>
            <input
              type="date"
              required
              value={formData.ObservationDate || ''}
              onChange={(e) => setFormData({...formData, ObservationDate: e.target.value})}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Value/Result</label>
          <input
            type="text"
            value={formData.Value || ''}
            onChange={(e) => setFormData({...formData, Value: e.target.value})}
            placeholder="Any specific measurement or finding"
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            rows="4"
            value={formData.Notes || ''}
            onChange={(e) => setFormData({...formData, Notes: e.target.value})}
            placeholder="Additional clinical notes or observations"
          />
        </div>

        <div className="modal-footer">
          <button type="button" onClick={closeModal} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            <Save size={18} />
            {loading ? 'Saving...' : 'Record Observation'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* Create Allergy Modal */}
{showModal === 'createAllergy' && selectedPatient && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Add Allergy for {selectedPatient.firstName} {selectedPatient.lastName}</h2>
        <button onClick={closeModal} className="close-btn">
          <X size={24} />
        </button>
      </div>
      <form onSubmit={handleSubmitAllergy} className="modal-body">
        <div className="form-group">
          <label>Allergy Name *</label>
          <input
            type="text"
            required
            value={formData.AllergyName || ''}
            onChange={(e) => setFormData({...formData, AllergyName: e.target.value})}
            placeholder="e.g., Penicillin, Peanuts"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Allergy Type</label>
            <input
              type="text"
              value={formData.AllergyType || ''}
              onChange={(e) => setFormData({...formData, AllergyType: e.target.value})}
              placeholder="e.g., Drug, Food, Environmental"
            />
          </div>

          <div className="form-group">
            <label>Severity *</label>
            <select
              required
              value={formData.Severity || 'Mild'}
              onChange={(e) => setFormData({...formData, Severity: e.target.value})}
            >
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
              <option value="Life-Threatening">Life-Threatening</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Reaction</label>
          <textarea
            rows="3"
            value={formData.Reaction || ''}
            onChange={(e) => setFormData({...formData, Reaction: e.target.value})}
            placeholder="Describe the allergic reaction"
          />
        </div>

        <div className="form-group">
          <label>Treatment</label>
          <textarea
            rows="3"
            value={formData.Treatment || ''}
            onChange={(e) => setFormData({...formData, Treatment: e.target.value})}
            placeholder="Recommended treatment or emergency action"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Diagnosed Date *</label>
            <input
              type="date"
              required
              value={formData.DiagnosedDate || ''}
              onChange={(e) => setFormData({...formData, DiagnosedDate: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.75rem'}}>
              <input
                type="checkbox"
                checked={formData.IsActive ?? true}
                onChange={(e) => setFormData({...formData, IsActive: e.target.checked})}
                style={{width: 'auto'}}
              />
              Currently Active
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Additional Notes</label>
          <textarea
            rows="2"
            value={formData.Notes || ''}
            onChange={(e) => setFormData({...formData, Notes: e.target.value})}
            placeholder="Any additional information"
          />
        </div>

        <div className="modal-footer">
          <button type="button" onClick={closeModal} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            <Save size={18} />
            {loading ? 'Adding...' : 'Add Allergy'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* Edit Allergy Modal */}
{showModal === 'editAllergy' && selectedAllergy && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Edit Allergy Record</h2>
        <button onClick={closeModal} className="close-btn">
          <X size={24} />
        </button>
      </div>
      <form onSubmit={handleUpdateAllergy} className="modal-body">
        <div className="form-group">
          <label>Allergy Name *</label>
          <input
            type="text"
            required
            value={formData.AllergyName || ''}
            onChange={(e) => setFormData({...formData, AllergyName: e.target.value})}
            placeholder="e.g., Penicillin, Peanuts"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Allergy Type</label>
            <input
              type="text"
              value={formData.AllergyType || ''}
              onChange={(e) => setFormData({...formData, AllergyType: e.target.value})}
              placeholder="e.g., Drug, Food, Environmental"
            />
          </div>

          <div className="form-group">
            <label>Severity *</label>
            <select
              required
              value={formData.Severity || 'Mild'}
              onChange={(e) => setFormData({...formData, Severity: e.target.value})}
            >
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
              <option value="Life-Threatening">Life-Threatening</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Reaction</label>
          <textarea
            rows="3"
            value={formData.Reaction || ''}
            onChange={(e) => setFormData({...formData, Reaction: e.target.value})}
            placeholder="Describe the allergic reaction"
          />
        </div>

        <div className="form-group">
          <label>Treatment</label>
          <textarea
            rows="3"
            value={formData.Treatment || ''}
            onChange={(e) => setFormData({...formData, Treatment: e.target.value})}
            placeholder="Recommended treatment or emergency action"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Diagnosed Date</label>
            <input
              type="date"
              value={formData.DiagnosedDate || ''}
              onChange={(e) => setFormData({...formData, DiagnosedDate: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.75rem'}}>
              <input
                type="checkbox"
                checked={formData.IsActive ?? true}
                onChange={(e) => setFormData({...formData, IsActive: e.target.checked})}
                style={{width: 'auto'}}
              />
              Currently Active
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Additional Notes</label>
          <textarea
            rows="2"
            value={formData.Notes || ''}
            onChange={(e) => setFormData({...formData, Notes: e.target.value})}
            placeholder="Any additional information"
          />
        </div>

        <div className="modal-footer">
          <button type="button" onClick={closeModal} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            <Save size={18} />
            {loading ? 'Updating...' : 'Update Allergy'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
{/* Create Treatment Modal */}
{showModal === 'createTreatment' && selectedPatient && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Create Treatment Plan for {selectedPatient.firstName} {selectedPatient.lastName}</h2>
        <button onClick={closeModal} className="close-btn">
          <X size={24} />
        </button>
      </div>
      <form onSubmit={handleSubmitTreatment} className="modal-body">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            required
            value={formData.Title || ''}
            onChange={(e) => setFormData({...formData, Title: e.target.value})}
            placeholder="e.g., Diabetes Management Plan"
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            required
            rows="3"
            value={formData.Description || ''}
            onChange={(e) => setFormData({...formData, Description: e.target.value})}
            placeholder="Brief description of the treatment"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              required
              value={formData.StartDate || ''}
              onChange={(e) => setFormData({...formData, StartDate: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={formData.EndDate || ''}
              onChange={(e) => setFormData({...formData, EndDate: e.target.value})}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Status *</label>
          <select
            required
            value={formData.Status || 'Active'}
            onChange={(e) => setFormData({...formData, Status: e.target.value})}
          >
            <option value="Active">Active</option>
            <option value="Planned">Planned</option>
            <option value="Completed">Completed</option>
            <option value="Discontinued">Discontinued</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        <div className="form-group">
          <label>Treatment Plan *</label>
          <textarea
            required
            rows="4"
            value={formData.TreatmentPlan || ''}
            onChange={(e) => setFormData({...formData, TreatmentPlan: e.target.value})}
            placeholder="Detailed treatment plan including medications, procedures, therapies..."
          />
        </div>

        <div className="form-group">
          <label>Goals</label>
          <textarea
            rows="3"
            value={formData.Goals || ''}
            onChange={(e) => setFormData({...formData, Goals: e.target.value})}
            placeholder="Treatment goals and expected outcomes"
          />
        </div>

        <div className="form-group">
          <label>Progress Notes</label>
          <textarea
            rows="3"
            value={formData.ProgressNotes || ''}
            onChange={(e) => setFormData({...formData, ProgressNotes: e.target.value})}
            placeholder="Initial observations and notes"
          />
        </div>

        <div className="modal-footer">
          <button type="button" onClick={closeModal} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            <Save size={18} />
            {loading ? 'Creating...' : 'Create Treatment'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* Edit Treatment Modal */}
{showModal === 'editTreatment' && selectedTreatment && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Edit Treatment Plan</h2>
        <button onClick={closeModal} className="close-btn">
          <X size={24} />
        </button>
      </div>
      <form onSubmit={handleUpdateTreatment} className="modal-body">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={formData.Title || ''}
            onChange={(e) => setFormData({...formData, Title: e.target.value})}
            placeholder="e.g., Diabetes Management Plan"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="3"
            value={formData.Description || ''}
            onChange={(e) => setFormData({...formData, Description: e.target.value})}
            placeholder="Brief description of the treatment"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={formData.StartDate || ''}
              onChange={(e) => setFormData({...formData, StartDate: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={formData.EndDate || ''}
              onChange={(e) => setFormData({...formData, EndDate: e.target.value})}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            value={formData.Status || 'Active'}
            onChange={(e) => setFormData({...formData, Status: e.target.value})}
          >
            <option value="Active">Active</option>
            <option value="Planned">Planned</option>
            <option value="Completed">Completed</option>
            <option value="Discontinued">Discontinued</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        <div className="form-group">
          <label>Treatment Plan</label>
          <textarea
            rows="4"
            value={formData.TreatmentPlan || ''}
            onChange={(e) => setFormData({...formData, TreatmentPlan: e.target.value})}
            placeholder="Detailed treatment plan including medications, procedures, therapies..."
          />
        </div>

        <div className="form-group">
          <label>Goals</label>
          <textarea
            rows="3"
            value={formData.Goals || ''}
            onChange={(e) => setFormData({...formData, Goals: e.target.value})}
            placeholder="Treatment goals and expected outcomes"
          />
        </div>

        <div className="form-group">
          <label>Progress Notes</label>
          <textarea
            rows="3"
            value={formData.ProgressNotes || ''}
            onChange={(e) => setFormData({...formData, ProgressNotes: e.target.value})}
            placeholder="Update progress and observations"
          />
        </div>

        <div className="modal-footer">
          <button type="button" onClick={closeModal} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            <Save size={18} />
            {loading ? 'Updating...' : 'Update Treatment'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* Edit Clinical Observation Modal */}
{showModal === 'editObservation' && selectedObservation && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Edit Clinical Observation</h2>
        <button onClick={closeModal} className="close-btn">
          <X size={24} />
        </button>
      </div>
      <form onSubmit={handleUpdateObservation} className="modal-body">
        <div className="form-row">
          <div className="form-group">
            <label>Gender</label>
            <select
              value={formData.Gender || ''}
              onChange={(e) => setFormData({...formData, Gender: e.target.value})}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              min="0"
              max="150"
              value={formData.Age || ''}
              onChange={(e) => setFormData({...formData, Age: parseInt(e.target.value)})}
              placeholder="Age in years"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Height (cm)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.Height || ''}
              onChange={(e) => setFormData({...formData, Height: parseFloat(e.target.value)})}
              placeholder="e.g., 170"
            />
          </div>

          <div className="form-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.Weight || ''}
              onChange={(e) => setFormData({...formData, Weight: parseFloat(e.target.value)})}
              placeholder="e.g., 70"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Blood Pressure</label>
            <input
              type="text"
              value={formData.BloodPressure || ''}
              onChange={(e) => setFormData({...formData, BloodPressure: e.target.value})}
              placeholder="e.g., 120/80"
            />
          </div>

          <div className="form-group">
            <label>Heart Rate (bpm)</label>
            <input
              type="number"
              min="0"
              value={formData.HeartRate || ''}
              onChange={(e) => setFormData({...formData, HeartRate: parseInt(e.target.value)})}
              placeholder="e.g., 72"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Observation Type</label>
            <input
              type="text"
              value={formData.ObservationType || ''}
              onChange={(e) => setFormData({...formData, ObservationType: e.target.value})}
              placeholder="e.g., Physical Examination"
            />
          </div>

          <div className="form-group">
            <label>Observation Date</label>
            <input
              type="date"
              value={formData.ObservationDate || ''}
              onChange={(e) => setFormData({...formData, ObservationDate: e.target.value})}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Value/Result</label>
          <input
            type="text"
            value={formData.Value || ''}
            onChange={(e) => setFormData({...formData, Value: e.target.value})}
            placeholder="Any specific measurement or finding"
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            rows="4"
            value={formData.Notes || ''}
            onChange={(e) => setFormData({...formData, Notes: e.target.value})}
            placeholder="Additional clinical notes or observations"
          />
        </div>

        <div className="modal-footer">
          <button type="button" onClick={closeModal} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            <Save size={18} />
            {loading ? 'Updating...' : 'Update Observation'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
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
                  <div className="history-section">
                    <h3>Prescriptions ({patientHistory?.prescriptions?.length || 0})</h3>
                    {patientHistory?.prescriptions?.length > 0 ? (
                      <div className="history-list">
                        {patientHistory.prescriptions.map((prescription, idx) => (
                          <div key={idx} className="history-item prescription-item">
                            <div className="history-item-header">
                              <div>
                                <strong style={{fontSize: '1rem', color: '#111827'}}>
                                  {prescription.medicationName || prescription.MedicationName}
                                </strong>
                                <div style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem'}}>
                                  {prescription.dosage || prescription.Dosage} - {prescription.frequency || prescription.Frequency}
                                </div>
                              </div>
                              <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                <span className={`status-badge status-${(prescription.status || prescription.Status)?.toLowerCase()}`}>
                                  {prescription.status || prescription.Status}
                                </span>
                                <button 
                                  className="action-btn-small"
                                  onClick={() => handleEditPrescription(prescription)}
                                  title="Edit prescription"
                                  style={{width: '32px', height: '32px'}}
                                >
                                  <Edit size={14} />
                                </button>
                                <button 
                                  className="delete-icon-btn"
                                  onClick={() => handleDeletePrescription(prescription.id || prescription.Id)}
                                  title="Delete prescription"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            
                            {(prescription.instructions || prescription.Instructions) && (
                              <div style={{marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#f0f9ff', borderRadius: '6px', borderLeft: '3px solid #3b82f6'}}>
                                <strong style={{display: 'block', marginBottom: '0.25rem', color: '#1e40af', fontSize: '0.875rem'}}>Instructions:</strong>
                                <p style={{margin: 0, fontSize: '0.875rem', color: '#1e3a8a', whiteSpace: 'pre-wrap'}}>{prescription.instructions || prescription.Instructions}</p>
                              </div>
                            )}
                            
                            {(prescription.notes || prescription.Notes) && (
                              <div style={{marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '6px', borderLeft: '3px solid #f59e0b'}}>
                                <strong style={{display: 'block', marginBottom: '0.25rem', color: '#92400e', fontSize: '0.875rem'}}>Notes:</strong>
                                <p style={{margin: 0, fontSize: '0.875rem', color: '#78350f', whiteSpace: 'pre-wrap'}}>{prescription.notes || prescription.Notes}</p>
                              </div>
                            )}
                            
                            <div className="history-item-meta">
                              <span>Start: {new Date(prescription.startDate || prescription.StartDate).toLocaleDateString()}</span>
                              {(prescription.endDate || prescription.EndDate) && (
                                <span>End: {new Date(prescription.endDate || prescription.EndDate).toLocaleDateString()}</span>
                              )}
                              {(prescription.isActive ?? prescription.IsActive) && <span className="active-indicator">Active</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">No prescriptions recorded</p>
                    )}
                  </div>

                  <div className="history-section">
                  <h3>Lab Results ({patientHistory?.labResults?.length || 0})</h3>
                  {patientHistory?.labResults?.length > 0 ? (
                    <div className="history-list">
                      {patientHistory.labResults.map((labResult, idx) => (
                        <div key={idx} className={`history-item lab-result-item ${(labResult.isAbnormal ?? labResult.IsAbnormal) ? 'abnormal' : ''}`}>
                          <div className="history-item-header">
                            <div>
                              <strong style={{fontSize: '1rem', color: (labResult.isAbnormal ?? labResult.IsAbnormal) ? '#dc2626' : '#059669'}}>
                                {labResult.testName || labResult.TestName}
                              </strong>
                              <div style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem'}}>
                                {labResult.testType || labResult.TestType} - {new Date(labResult.testDate || labResult.TestDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                              <span className={`status-badge status-${(labResult.status || labResult.Status)?.toLowerCase().replace(' ', '-')}`}>
                                {labResult.status || labResult.Status}
                              </span>
                              {(labResult.isAbnormal ?? labResult.IsAbnormal) && (
                                <span className="abnormal-badge">
                                  Abnormal
                                </span>
                              )}
                              <button 
                                className="action-btn-small"
                                onClick={() => handleEditLabResult(labResult)}
                                title="Edit lab result"
                                style={{width: '32px', height: '32px'}}
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                className="delete-icon-btn"
                                onClick={() => handleDeleteLabResult(labResult.id || labResult.Id)}
                                title="Delete lab result"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div style={{marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}}>
                            <div>
                              <strong style={{fontSize: '0.875rem', color: '#111827'}}>Result:</strong>
                              <span style={{fontSize: '0.875rem', color: (labResult.isAbnormal ?? labResult.IsAbnormal) ? '#dc2626' : '#374151', fontWeight: (labResult.isAbnormal ?? labResult.IsAbnormal) ? '600' : 'normal', marginLeft: '0.5rem'}}>
                                {labResult.result || labResult.Result}
                              </span>
                            </div>
                            
                            {(labResult.referenceRange || labResult.ReferenceRange) && (
                              <div>
                                <strong style={{fontSize: '0.875rem', color: '#111827'}}>Reference:</strong>
                                <span style={{fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem'}}>
                                  {labResult.referenceRange || labResult.ReferenceRange}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {(labResult.performedBy || labResult.PerformedBy) && (
                            <div style={{marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280'}}>
                              <strong>Performed By:</strong> {labResult.performedBy || labResult.PerformedBy}
                            </div>
                          )}
                          
                          {(labResult.notes || labResult.Notes) && (
                            <div style={{marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '6px', borderLeft: '3px solid #f59e0b'}}>
                              <strong style={{display: 'block', marginBottom: '0.25rem', color: '#92400e', fontSize: '0.875rem'}}>Notes:</strong>
                              <p style={{margin: 0, fontSize: '0.875rem', color: '#78350f', whiteSpace: 'pre-wrap'}}>{labResult.notes || labResult.Notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">No lab results recorded</p>
                  )}
                </div>
                <div className="history-section">
                    <h3>Allergies ({patientHistory?.allergies?.length || 0})</h3>
                    {patientHistory?.allergies?.length > 0 ? (
                      <div className="history-list">
                        {patientHistory.allergies.map((allergy, idx) => {
                          const diagnosedDate = new Date(allergy.diagnosedDate || allergy.DiagnosedDate);
                          const isActive = allergy.isActive ?? allergy.IsActive ?? true;
                          const severity = allergy.severity || allergy.Severity;
                          
                          return (
                            <div key={idx} className={`history-item allergy-item ${!isActive ? 'inactive' : ''}`}>
                              <div className="history-item-header">
                                <div>
                                  <strong style={{fontSize: '1rem', color: '#dc2626'}}>
                                    {allergy.allergyName || allergy.AllergyName}
                                  </strong>
                                  {(allergy.allergyType || allergy.AllergyType) && (
                                    <div style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem'}}>
                                      Type: {allergy.allergyType || allergy.AllergyType}
                                    </div>
                                  )}
                                </div>
                                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap'}}>
                                  <span className={`severity-badge severity-${severity?.toLowerCase()}`}>
                                    {severity}
                                  </span>
                                  {isActive && (
                                    <span className="active-badge">
                                      Active
                                    </span>
                                  )}
                                  <button 
                                    className="action-btn-small"
                                    onClick={() => handleEditAllergy(allergy)}
                                    title="Edit allergy"
                                    style={{width: '32px', height: '32px'}}
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button 
                                    className="delete-icon-btn"
                                    onClick={() => handleDeleteAllergy(allergy.id || allergy.Id)}
                                    title="Delete allergy"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                              
                              {(allergy.reaction || allergy.Reaction) && (
                                <div style={{marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '6px', borderLeft: '3px solid #ef4444'}}>
                                  <strong style={{display: 'block', marginBottom: '0.25rem', color: '#991b1b', fontSize: '0.875rem'}}>Reaction:</strong>
                                  <p style={{margin: 0, fontSize: '0.875rem', color: '#7f1d1d', whiteSpace: 'pre-wrap'}}>{allergy.reaction || allergy.Reaction}</p>
                                </div>
                              )}
                              
                              {(allergy.treatment || allergy.Treatment) && (
                                <div style={{marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#f0f9ff', borderRadius: '6px', borderLeft: '3px solid #3b82f6'}}>
                                  <strong style={{display: 'block', marginBottom: '0.25rem', color: '#1e40af', fontSize: '0.875rem'}}>Treatment:</strong>
                                  <p style={{margin: 0, fontSize: '0.875rem', color: '#1e3a8a', whiteSpace: 'pre-wrap'}}>{allergy.treatment || allergy.Treatment}</p>
                                </div>
                              )}
                              
                              {(allergy.notes || allergy.Notes) && (
                                <div style={{marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '6px', borderLeft: '3px solid #f59e0b'}}>
                                  <strong style={{display: 'block', marginBottom: '0.25rem', color: '#92400e', fontSize: '0.875rem'}}>Notes:</strong>
                                  <p style={{margin: 0, fontSize: '0.875rem', color: '#78350f', whiteSpace: 'pre-wrap'}}>{allergy.notes || allergy.Notes}</p>
                                </div>
                              )}
                              
                              <div className="history-item-meta">
                                <span>Diagnosed: {diagnosedDate.toLocaleDateString()}</span>
                                <span>Added by: {allergy.createdByRole || allergy.CreatedByRole}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="no-data">No allergies recorded</p>
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

      {/* Create Prescription Modal */}
      {showModal === 'createPrescription' && selectedPatient && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Prescription for {selectedPatient.firstName} {selectedPatient.lastName}</h2>
              <button onClick={closeModal} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitPrescription} className="modal-body">
              <div className="form-group">
                <label>Medication Name *</label>
                <input
                  type="text"
                  required
                  value={formData.MedicationName || ''}
                  onChange={(e) => setFormData({...formData, MedicationName: e.target.value})}
                  placeholder="e.g., Amoxicillin"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dosage *</label>
                  <input
                    type="text"
                    required
                    value={formData.Dosage || ''}
                    onChange={(e) => setFormData({...formData, Dosage: e.target.value})}
                    placeholder="e.g., 500mg"
                  />
                </div>

                <div className="form-group">
                  <label>Frequency *</label>
                  <input
                    type="text"
                    required
                    value={formData.Frequency || ''}
                    onChange={(e) => setFormData({...formData, Frequency: e.target.value})}
                    placeholder="e.g., Twice daily"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.StartDate || ''}
                    onChange={(e) => setFormData({...formData, StartDate: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.EndDate || ''}
                    onChange={(e) => setFormData({...formData, EndDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  required
                  value={formData.Status || 'Active'}
                  onChange={(e) => setFormData({...formData, Status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Discontinued">Discontinued</option>
                </select>
              </div>

              <div className="form-group">
                <label>Instructions</label>
                <textarea
                  rows="3"
                  value={formData.Instructions || ''}
                  onChange={(e) => setFormData({...formData, Instructions: e.target.value})}
                  placeholder="How to take the medication"
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
                  {loading ? 'Creating...' : 'Create Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Prescription Modal */}
      {showModal === 'editPrescription' && selectedPrescription && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Prescription</h2>
              <button onClick={closeModal} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdatePrescription} className="modal-body">
              <div className="form-group">
                <label>Medication Name *</label>
                <input
                  type="text"
                  required
                  value={formData.MedicationName || ''}
                  onChange={(e) => setFormData({...formData, MedicationName: e.target.value})}
                  placeholder="e.g., Amoxicillin"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dosage *</label>
                  <input
                    type="text"
                    required
                    value={formData.Dosage || ''}
                    onChange={(e) => setFormData({...formData, Dosage: e.target.value})}
                    placeholder="e.g., 500mg"
                  />
                </div>

                <div className="form-group">
                  <label>Frequency *</label>
                  <input
                    type="text"
                    required
                    value={formData.Frequency || ''}
                    onChange={(e) => setFormData({...formData, Frequency: e.target.value})}
                    placeholder="e.g., Twice daily"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.StartDate || ''}
                    onChange={(e) => setFormData({...formData, StartDate: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.EndDate || ''}
                    onChange={(e) => setFormData({...formData, EndDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    required
                    value={formData.Status || 'Active'}
                    onChange={(e) => setFormData({...formData, Status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Is Active</label>
                  <select
                    value={formData.IsActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, IsActive: e.target.value === 'true'})}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Instructions</label>
                <textarea
                  rows="3"
                  value={formData.Instructions || ''}
                  onChange={(e) => setFormData({...formData, Instructions: e.target.value})}
                  placeholder="How to take the medication"
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
                  {loading ? 'Updating...' : 'Update Prescription'}
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
    /* Lab Result Styles */
  .labresults-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .labresults-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 1.5rem;
  }

  .labresult-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: all 0.2s;
    border-left: 4px solid #10b981;
  }

  .labresult-card.abnormal {
    border-left-color: #ef4444;
    background-color: #fef2f2;
  }

  .labresult-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  .labresult-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .labresult-card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #059669;
    margin-bottom: 0.5rem;
  }

  .labresult-card.abnormal .labresult-card-title {
    color: #dc2626;
  }

  .labresult-card-patient {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .labresult-card-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .labresult-card-type,
  .labresult-card-result,
  .labresult-card-reference,
  .labresult-card-performed {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #374151;
  }

  .labresult-card-type strong,
  .labresult-card-result strong,
  .labresult-card-reference strong,
  .labresult-card-performed strong {
    color: #111827;
    min-width: 100px;
  }

  .labresult-card-result .abnormal-result {
    color: #dc2626;
    font-weight: 600;
  }

  .labresult-card-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: #f9fafb;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .labresult-card-notes {
    padding: 0.75rem;
    background-color: #fffbeb;
    border-left: 3px solid #f59e0b;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .labresult-card-notes strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #92400e;
    font-size: 0.875rem;
  }

  .labresult-card-notes p {
    margin: 0;
    color: #78350f;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .labresult-card-footer {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
  }

  .labresult-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .labresult-card-actions {
    display: flex;
    gap: 0.5rem;
  }

  .abnormal-badge {
    padding: 0.25rem 0.75rem;
    background-color: #fee2e2;
    color: #991b1b;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .lab-result-item {
    border-left: 3px solid #10b981 !important;
  }

  .lab-result-item.abnormal {
    border-left-color: #ef4444 !important;
  }

  .status-pending {
    background-color: #fef3c7;
    color: #92400e;
  }

  .status-in {
    background-color: #dbeafe;
    color: #1e40af;
  }

  .status-cancelled {
    background-color: #fee2e2;
    color: #991b1b;
  }
    .appointments-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
    .prescription-item {
    border-left: 3px solid #8b5cf6 !important;
  }

  .prescription-item .history-item-header strong {
    color: #6b21a8;
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

  /* Clinical Observation Styles */
.observations-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.observations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.observation-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.2s;
  border-left: 4px solid #6366f1;
}

.observation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.observation-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.observation-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #4338ca;
  margin-bottom: 0.5rem;
}

.observation-card-patient {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.observation-card-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
}

.observation-card-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.observation-vitals-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 6px;
}

.vital-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.vital-item strong {
  color: #374151;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.vital-item span {
  color: #111827;
  font-weight: 500;
}

.observation-type-section {
  padding: 0.75rem;
  background-color: #eff6ff;
  border-left: 3px solid #3b82f6;
  border-radius: 6px;
  font-size: 0.875rem;
}

.observation-type-section strong {
  display: block;
  margin-bottom: 0.25rem;
  color: #1e40af;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.observation-type-section span {
  color: #1e3a8a;
}

.observation-value {
  color: #1e40af;
  font-weight: 600;
}

.observation-card-notes {
  padding: 0.75rem;
  background-color: #fffbeb;
  border-left: 3px solid #f59e0b;
  border-radius: 6px;
  font-size: 0.875rem;
}

.observation-card-notes strong {
  display: block;
  margin-bottom: 0.25rem;
  color: #92400e;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.observation-card-notes p {
  margin: 0;
  color: #78350f;
  line-height: 1.5;
  white-space: pre-wrap;
}

.observation-card-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.observation-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.observation-card-actions {
  display: flex;
  gap: 0.5rem;
}


/* Treatment Styles */
  .treatments-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .treatments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .treatment-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: all 0.2s;
    border-left: 4px solid #8b5cf6;
  }

  .treatment-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  .treatment-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .treatment-card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #6b21a8;
    margin-bottom: 0.5rem;
  }

  .treatment-card-patient {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .treatment-card-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .treatment-card-description {
    font-size: 0.875rem;
    color: #374151;
    line-height: 1.5;
    margin: 0;
  }

  .treatment-card-dates {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: #f9fafb;
    border-radius: 6px;
  }

  .treatment-card-plan,
  .treatment-card-goals,
  .treatment-card-progress {
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .treatment-card-plan {
    background-color: #f0f9ff;
    border-left: 3px solid #3b82f6;
  }

  .treatment-card-plan strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #1e40af;
    font-size: 0.875rem;
  }

  .treatment-card-plan p {
    margin: 0;
    color: #1e3a8a;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .treatment-card-goals {
    background-color: #f0fdf4;
    border-left: 3px solid #10b981;
  }

  .treatment-card-goals strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #065f46;
    font-size: 0.875rem;
  }

  .treatment-card-goals p {
    margin: 0;
    color: #064e3b;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .treatment-card-progress {
    background-color: #fffbeb;
    border-left: 3px solid #f59e0b;
  }

  .treatment-card-progress strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #92400e;
    font-size: 0.875rem;
  }

  .treatment-card-progress p {
    margin: 0;
    color: #78350f;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .treatment-card-footer {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
  }

  .treatment-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .treatment-card-actions {
    display: flex;
    gap: 0.5rem;
  }

  .status-planned {
    background-color: #dbeafe;
    color: #1e40af;
  }

  .status-on {
    background-color: #fef3c7;
    color: #92400e;
  }

  @media (max-width: 768px) {
    .treatments-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Allergy Styles */
.allergies-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.allergies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.allergy-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.2s;
  border-left: 4px solid #10b981;
}

.allergy-card.inactive {
  opacity: 0.7;
  border-left-color: #9ca3af;
}

.allergy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.allergy-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.allergy-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 0.5rem;
}

.allergy-card-patient {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.allergy-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.allergy-card-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.allergy-card-type strong {
  color: #111827;
  min-width: 60px;
}

.allergy-card-reaction,
.allergy-card-treatment {
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

.allergy-card-reaction {
  background-color: #fef2f2;
  border-left: 3px solid #ef4444;
}

.allergy-card-reaction strong {
  display: block;
  margin-bottom: 0.25rem;
  color: #991b1b;
  font-size: 0.875rem;
}

.allergy-card-reaction p {
  margin: 0;
  color: #7f1d1d;
  line-height: 1.5;
  white-space: pre-wrap;
}

card-treatment {
  background-color: #f0f9ff;
  border-left: 3px solid #3b82f6;
}

.allergy-card-treatment strong {
  display: block;
  margin-bottom: 0.25rem;
  color: #1e40af;
  font-size: 0.875rem;
}

.allergy-card-treatment p {
  margin: 0;
  color: #1e3a8a;
  line-height: 1.5;
  white-space: pre-wrap;
}

.allergy-card-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #6b7280;
}

.allergy-card-notes {
  padding: 0.75rem;
  background-color: #fffbeb;
  border-left: 3px solid #f59e0b;
  border-radius: 6px;
  font-size: 0.875rem;
}

.allergy-card-notes strong {
  display: block;
  margin-bottom: 0.25rem;
  color: #92400e;
  font-size: 0.875rem;
}

.allergy-card-notes p {
  margin: 0;
  color: #78350f;
  line-height: 1.5;
  white-space: pre-wrap;
}

.allergy-card-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.allergy-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.allergy-card-actions {
  display: flex;
  gap: 0.5rem;
}

.severity-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.severity-mild {
  background-color: #d1fae5;
  color: #065f46;
}

.severity-moderate {
  background-color: #fef3c7;
  color: #92400e;
}

.severity-severe {
  background-color: #fee2e2;
  color: #991b1b;
}

.severity-life-threatening {
  background-color: #fce7f3;
  color: #9f1239;
  font-weight: 600;
}

.allergy-item {
  border-left: 3px solid #dc2626 !important;
}

.allergy-item.inactive {
  opacity: 0.6;
  border-left-color: #9ca3af !important;
}

@media (max-width: 768px) {
  .allergies-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .observations-grid {
    grid-template-columns: 1fr;
  }
  
  .observation-vitals-grid {
    grid-template-columns: 1fr;
  }
}
    /* Prescription Styles */
  .prescriptions-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .prescriptions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 1.5rem;
  }

  .prescription-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: all 0.2s;
    border-left: 4px solid #8b5cf6;
  }

  .prescription-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  .prescription-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .prescription-card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #6b21a8;
    margin-bottom: 0.5rem;
  }

  .prescription-card-patient {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .prescription-card-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .prescription-card-dosage,
  .prescription-card-frequency {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #374151;
  }

  .prescription-card-dosage strong,
  .prescription-card-frequency strong {
    color: #111827;
    min-width: 80px;
  }

  .prescription-card-dates {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: #f9fafb;
    border-radius: 6px;
  }

  .date-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .prescription-card-instructions,
  .prescription-card-notes {
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .prescription-card-instructions {
    background-color: #f0f9ff;
    border-left: 3px solid #3b82f6;
  }

  .prescription-card-instructions strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #1e40af;
    font-size: 0.875rem;
  }

  .prescription-card-instructions p {
    margin: 0;
    color: #1e3a8a;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .prescription-card-notes {
    background-color: #fffbeb;
    border-left: 3px solid #f59e0b;
  }

  .prescription-card-notes strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #92400e;
    font-size: 0.875rem;
  }

  .prescription-card-notes p {
    margin: 0;
    color: #78350f;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .prescription-card-footer {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
  }

  .prescription-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .prescription-card-actions {
    display: flex;
    gap: 0.5rem;
  }

  .active-badge {
    padding: 0.25rem 0.75rem;
    background-color: #d1fae5;
    color: #065f46;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-active {
    background-color: #d1fae5;
    color: #065f46;
  }

  .status-completed {
    background-color: #dbeafe;
    color: #1e40af;
  }

  .status-discontinued {
    background-color: #fee2e2;
    color: #991b1b;
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
    
    .prescriptions-grid {
      grid-template-columns: 1fr;
    }
    .labresults-grid {
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