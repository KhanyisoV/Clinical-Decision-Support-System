using FinalYearProject.DTOs;
using FinalYearProject.Models;
using FinalYearProject.Repositories;
using FinalYearProject.Services;

namespace FinalYearProject.Services
{
    public interface IClientHistoryService
    {
        Task<ClientHistoryDto> GetClientHistoryAsync(
            int clientId,
            ClientHistoryFilterDto? filter = null
        );
        Task<List<ClientTimelineEventDto>> GetClientTimelineAsync(
            int clientId,
            ClientHistoryFilterDto? filter = null
        );
    }

    public class ClientHistoryService : IClientHistoryService
    {
        private readonly IClientRepository _clientRepo;
        private readonly IDiagnosisRepository _diagnosisRepo;
        private readonly ITreatmentRepository _treatmentRepo;
        private readonly IAppointmentRepository _appointmentRepo;
        private readonly IPrescriptionRepository _prescriptionRepo;
        private readonly ISymptomRepository _symptomRepo;
        private readonly IClinicalObservationRepository _observationRepo;
        private readonly IRecommendationRepository _recommendationRepo;
        private readonly IProgressRepository _progressRepo;
        private readonly IMappingService _mappingService;

        public ClientHistoryService(
            IClientRepository clientRepo,
            IDiagnosisRepository diagnosisRepo,
            ITreatmentRepository treatmentRepo,
            IAppointmentRepository appointmentRepo,
            IPrescriptionRepository prescriptionRepo,
            ISymptomRepository symptomRepo,
            IClinicalObservationRepository observationRepo,
            IRecommendationRepository recommendationRepo,
            IProgressRepository progressRepo,
            IMappingService mappingService
        )
        {
            _clientRepo = clientRepo;
            _diagnosisRepo = diagnosisRepo;
            _treatmentRepo = treatmentRepo;
            _appointmentRepo = appointmentRepo;
            _prescriptionRepo = prescriptionRepo;
            _symptomRepo = symptomRepo;
            _observationRepo = observationRepo;
            _recommendationRepo = recommendationRepo;
            _progressRepo = progressRepo;
            _mappingService = mappingService;
        }

        public async Task<ClientHistoryDto> GetClientHistoryAsync(
            int clientId,
            ClientHistoryFilterDto? filter = null
        )
        {
            var client = _clientRepo.GetById(clientId);
            if (client == null)
                throw new Exception("Client not found");

            var history = new ClientHistoryDto { Client = _mappingService.ToClientDto(client) };

            // Get all related data using existing repository methods
            var diagnoses = _diagnosisRepo.GetByClientId(clientId).AsEnumerable();
            var treatments = await _treatmentRepo.GetByClientIdAsync(clientId);
            var appointments = _appointmentRepo.GetByClientId(clientId).AsEnumerable();
            var prescriptions = await _prescriptionRepo.GetByClientIdAsync(clientId);

            // Combine active and resolved symptoms
            var activeSymptoms = _symptomRepo.GetActiveSymptomsByClientId(clientId);
            var resolvedSymptoms = _symptomRepo.GetResolvedSymptomsByClientId(clientId);
            var symptoms = activeSymptoms.Concat(resolvedSymptoms);

            var observations = _observationRepo.GetByClientId(clientId).AsEnumerable();
            var recommendations = _recommendationRepo.GetByClientId(clientId).AsEnumerable();
            var progressRecords = await _progressRepo.GetByClientIdAsync(clientId);

            // Apply filters if provided
            if (filter != null)
            {
                if (filter.StartDate.HasValue)
                {
                    diagnoses = diagnoses.Where(d => d.DateDiagnosed >= filter.StartDate.Value);
                    treatments = treatments.Where(t => t.StartDate >= filter.StartDate.Value);
                    appointments = appointments.Where(a =>
                        a.AppointmentDate >= filter.StartDate.Value
                    );
                    prescriptions = prescriptions.Where(p => p.StartDate >= filter.StartDate.Value);
                    symptoms = symptoms.Where(s => s.DateReported >= filter.StartDate.Value);
                    observations = observations.Where(o =>
                        o.ObservationDate >= filter.StartDate.Value
                    );
                    recommendations = recommendations.Where(r =>
                        r.DateGiven >= filter.StartDate.Value
                    );
                    progressRecords = progressRecords.Where(p =>
                        p.DateRecorded >= filter.StartDate.Value
                    );
                }

                if (filter.EndDate.HasValue)
                {
                    diagnoses = diagnoses.Where(d => d.DateDiagnosed <= filter.EndDate.Value);
                    treatments = treatments.Where(t => t.StartDate <= filter.EndDate.Value);
                    appointments = appointments.Where(a =>
                        a.AppointmentDate <= filter.EndDate.Value
                    );
                    prescriptions = prescriptions.Where(p => p.StartDate <= filter.EndDate.Value);
                    symptoms = symptoms.Where(s => s.DateReported <= filter.EndDate.Value);
                    observations = observations.Where(o =>
                        o.ObservationDate <= filter.EndDate.Value
                    );
                    recommendations = recommendations.Where(r =>
                        r.DateGiven <= filter.EndDate.Value
                    );
                    progressRecords = progressRecords.Where(p =>
                        p.DateRecorded <= filter.EndDate.Value
                    );
                }

                if (!filter.IncludeInactive)
                {
                    diagnoses = diagnoses.Where(d => d.IsActive);
                    treatments = treatments.Where(t => t.Status == "Active");
                    symptoms = symptoms.Where(s => s.IsActive);
                    prescriptions = prescriptions.Where(p => p.IsActive);
                    recommendations = recommendations.Where(r => r.IsActive);
                }

                if (filter.DoctorId.HasValue)
                {
                    diagnoses = diagnoses.Where(d =>
                        d.DiagnosedByDoctorId == filter.DoctorId.Value
                    );
                    treatments = treatments.Where(t =>
                        t.ProvidedByDoctorId == filter.DoctorId.Value
                    );
                    appointments = appointments.Where(a => a.DoctorId == filter.DoctorId.Value);
                    prescriptions = prescriptions.Where(p =>
                        p.PrescribedByDoctorId == filter.DoctorId.Value
                    );
                    symptoms = symptoms.Where(s => s.AddedByDoctorId == filter.DoctorId.Value);
                    observations = observations.Where(o =>
                        o.RecordedByDoctorId == filter.DoctorId.Value
                    );
                    recommendations = recommendations.Where(r =>
                        r.DoctorId == filter.DoctorId.Value
                    );
                    progressRecords = progressRecords.Where(p =>
                        p.RecordedByDoctorId == filter.DoctorId.Value
                    );
                }
            }

            // Map to DTOs
            history.Diagnoses = diagnoses.Select(d => MapDiagnosisToDto(d)).ToList();
            history.Treatments = treatments.Select(t => MapTreatmentToDto(t)).ToList();
            history.Appointments = appointments.Select(a => MapAppointmentToDto(a)).ToList();
            history.Prescriptions = prescriptions.Select(p => MapPrescriptionToDto(p)).ToList();
            history.Symptoms = symptoms.Select(s => _mappingService.ToSymptomDto(s)).ToList();
            history.ClinicalObservations = observations
                .Select(o => MapObservationToDto(o))
                .ToList();
            history.Recommendations = recommendations
                .Select(r => MapRecommendationToDto(r))
                .ToList();
            history.ProgressRecords = progressRecords.Select(p => MapProgressToDto(p)).ToList();

            // Calculate summary
            history.Summary = CalculateSummary(history);

            return history;
        }

        public async Task<List<ClientTimelineEventDto>> GetClientTimelineAsync(
            int clientId,
            ClientHistoryFilterDto? filter = null
        )
        {
            var history = await GetClientHistoryAsync(clientId, filter);
            var timeline = new List<ClientTimelineEventDto>();

            // Add diagnoses to timeline
            foreach (var diagnosis in history.Diagnoses)
            {
                timeline.Add(
                    new ClientTimelineEventDto
                    {
                        EventDate = diagnosis.DateDiagnosed,
                        EventType = "Diagnosis",
                        Title = diagnosis.Title,
                        Description = diagnosis.Description,
                        Status = diagnosis.Status,
                        DoctorName =
                            $"{diagnosis.DiagnosedByDoctor.FirstName} {diagnosis.DiagnosedByDoctor.LastName}".Trim(),
                    }
                );
            }

            // Add treatments to timeline
            foreach (var treatment in history.Treatments)
            {
                timeline.Add(
                    new ClientTimelineEventDto
                    {
                        EventDate = treatment.StartDate,
                        EventType = "Treatment",
                        Title = treatment.Title,
                        Description = treatment.Description,
                        Status = treatment.Status,
                        DoctorName =
                            $"{treatment.ProvidedByDoctor.FirstName} {treatment.ProvidedByDoctor.LastName}".Trim(),
                        RelatedId = treatment.Id,
                    }
                );
            }

            // Add appointments to timeline
            foreach (var appointment in history.Appointments)
            {
                timeline.Add(
                    new ClientTimelineEventDto
                    {
                        EventDate = appointment.AppointmentDate,
                        EventType = "Appointment",
                        Title = appointment.Title,
                        Description = appointment.Description ?? "",
                        Status = appointment.Status,
                        DoctorName =
                            $"{appointment.Doctor.FirstName} {appointment.Doctor.LastName}".Trim(),
                        RelatedId = appointment.Id,
                    }
                );
            }

            // Add prescriptions to timeline
            foreach (var prescription in history.Prescriptions)
            {
                timeline.Add(
                    new ClientTimelineEventDto
                    {
                        EventDate = prescription.StartDate,
                        EventType = "Prescription",
                        Title = prescription.MedicationName,
                        Description = $"{prescription.Dosage}, {prescription.Frequency}",
                        Status = prescription.Status,
                        DoctorName =
                            $"{prescription.PrescribedByDoctor.FirstName} {prescription.PrescribedByDoctor.LastName}".Trim(),
                        RelatedId = prescription.Id,
                    }
                );
            }

            // Add symptoms to timeline
            foreach (var symptom in history.Symptoms)
            {
                timeline.Add(
                    new ClientTimelineEventDto
                    {
                        EventDate = symptom.DateReported,
                        EventType = "Symptom",
                        Title = symptom.Name,
                        Description = symptom.Description ?? "",
                        Status = symptom.IsActive ? "Active" : "Resolved",
                        DoctorName =
                            $"{symptom.AddedByDoctor.FirstName} {symptom.AddedByDoctor.LastName}".Trim(),
                    }
                );
            }

            // Add clinical observations to timeline
            foreach (var observation in history.ClinicalObservations)
            {
                timeline.Add(
                    new ClientTimelineEventDto
                    {
                        EventDate = observation.ObservationDate,
                        EventType = "Clinical Observation",
                        Title = observation.ObservationType,
                        Description = observation.Value,
                        DoctorName =
                            $"{observation.RecordedByDoctor.FirstName} {observation.RecordedByDoctor.LastName}".Trim(),
                        RelatedId = observation.Id,
                    }
                );
            }

            // Add recommendations to timeline
            foreach (var recommendation in history.Recommendations)
            {
                timeline.Add(
                    new ClientTimelineEventDto
                    {
                        EventDate = recommendation.DateGiven,
                        EventType = "Recommendation",
                        Title = recommendation.Title,
                        Description = recommendation.Description,
                        Status = recommendation.IsActive ? "Active" : "Inactive",
                        DoctorName =
                            $"{recommendation.Doctor.FirstName} {recommendation.Doctor.LastName}".Trim(),
                    }
                );
            }

            // Add progress records to timeline
            foreach (var progress in history.ProgressRecords)
            {
                timeline.Add(
                    new ClientTimelineEventDto
                    {
                        EventDate = progress.DateRecorded,
                        EventType = "Progress Note",
                        Title = progress.Title,
                        Description = progress.Notes,
                        Status = progress.ProgressStatus,
                        DoctorName = progress.DoctorName,
                        RelatedId = progress.Id,
                    }
                );
            }

            // Sort by date descending (most recent first)
            return timeline.OrderByDescending(t => t.EventDate).ToList();
        }

        private ClientHistorySummaryDto CalculateSummary(ClientHistoryDto history)
        {
            var now = DateTime.UtcNow;
            var upcomingAppointments = history
                .Appointments.Where(a => a.AppointmentDate >= now && a.Status != "Cancelled")
                .OrderBy(a => a.AppointmentDate)
                .ToList();

            var completedAppointments = history
                .Appointments.Where(a => a.Status == "Completed" || a.AppointmentDate < now)
                .ToList();

            var doctors = new HashSet<string>();
            if (history.Client.AssignedDoctor != null)
            {
                doctors.Add(
                    $"{history.Client.AssignedDoctor.FirstName} {history.Client.AssignedDoctor.LastName} ({history.Client.AssignedDoctor.Specialization})".Trim()
                );
            }

            return new ClientHistorySummaryDto
            {
                TotalDiagnoses = history.Diagnoses.Count,
                ActiveDiagnoses = history.Diagnoses.Count(d => d.IsActive),
                TotalTreatments = history.Treatments.Count,
                ActiveTreatments = history.Treatments.Count(t => t.Status == "Active"),
                TotalAppointments = history.Appointments.Count,
                CompletedAppointments = completedAppointments.Count,
                UpcomingAppointments = upcomingAppointments.Count,
                TotalPrescriptions = history.Prescriptions.Count,
                ActivePrescriptions = history.Prescriptions.Count(p => p.IsActive),
                TotalSymptoms = history.Symptoms.Count,
                ActiveSymptoms = history.Symptoms.Count(s => s.IsActive),
                TotalObservations = history.ClinicalObservations.Count,
                TotalRecommendations = history.Recommendations.Count,
                TotalProgressRecords = history.ProgressRecords.Count,
                LastAppointmentDate = history
                    .Appointments.Where(a => a.AppointmentDate < now)
                    .OrderByDescending(a => a.AppointmentDate)
                    .FirstOrDefault()
                    ?.AppointmentDate,
                NextAppointmentDate = upcomingAppointments.FirstOrDefault()?.AppointmentDate,
                LastObservationDate = history
                    .ClinicalObservations.OrderByDescending(o => o.ObservationDate)
                    .FirstOrDefault()
                    ?.ObservationDate,
                CurrentDoctors = doctors.ToList(),
            };
        }

        // Helper mapping methods
        private DiagnosisDto MapDiagnosisToDto(Diagnosis d)
        {
            return new DiagnosisDto
            {
                Title = d.Title,
                Description = d.Description,
                DiagnosisCode = d.DiagnosisCode,
                Severity = d.Severity,
                Status = d.Status,
                TreatmentPlan = d.TreatmentPlan,
                Notes = d.Notes,
                DateDiagnosed = d.DateDiagnosed,
                DateResolved = d.DateResolved,
                IsActive = d.IsActive,
                Client = new ClientBasicDto
                {
                    UserName = d.Client.UserName,
                    FirstName = d.Client.FirstName,
                    LastName = d.Client.LastName,
                },
                DiagnosedByDoctor = new DoctorBasicDto
                {
                    UserName = d.DiagnosedByDoctor.UserName,
                    FirstName = d.DiagnosedByDoctor.FirstName,
                    LastName = d.DiagnosedByDoctor.LastName,
                    Specialization = d.DiagnosedByDoctor.Specialization,
                },
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
            };
        }

        private TreatmentDto MapTreatmentToDto(Treatment t)
        {
            return new TreatmentDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                Status = t.Status,
                TreatmentPlan = t.TreatmentPlan,
                Goals = t.Goals,
                ProgressNotes = t.ProgressNotes,
                Client = new ClientBasicDto
                {
                    UserName = t.Client.UserName,
                    FirstName = t.Client.FirstName,
                    LastName = t.Client.LastName,
                },
                ProvidedByDoctor = new DoctorBasicDto
                {
                    UserName = t.ProvidedByDoctor.UserName,
                    FirstName = t.ProvidedByDoctor.FirstName,
                    LastName = t.ProvidedByDoctor.LastName,
                    Specialization = t.ProvidedByDoctor.Specialization,
                },
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
            };
        }

        private AppointmentDto MapAppointmentToDto(Appointment a)
        {
            return new AppointmentDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                AppointmentDate = a.AppointmentDate,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Status = a.Status,
                Location = a.Location,
                Notes = a.Notes,
                Client = new ClientBasicDto
                {
                    UserName = a.Client.UserName,
                    FirstName = a.Client.FirstName,
                    LastName = a.Client.LastName,
                },
                Doctor = new DoctorBasicDto
                {
                    UserName = a.Doctor.UserName,
                    FirstName = a.Doctor.FirstName,
                    LastName = a.Doctor.LastName,
                    Specialization = a.Doctor.Specialization,
                },
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt,
            };
        }

        private PrescriptionDto MapPrescriptionToDto(Prescription p)
        {
            return new PrescriptionDto
            {
                Id = p.Id,
                MedicationName = p.MedicationName,
                Dosage = p.Dosage,
                Frequency = p.Frequency,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Instructions = p.Instructions,
                Notes = p.Notes,
                Status = p.Status,
                IsActive = p.IsActive,
                Client = new ClientBasicDto
                {
                    UserName = p.Client.UserName,
                    FirstName = p.Client.FirstName,
                    LastName = p.Client.LastName,
                },
                PrescribedByDoctor = new DoctorBasicDto
                {
                    UserName = p.PrescribedByDoctor.UserName,
                    FirstName = p.PrescribedByDoctor.FirstName,
                    LastName = p.PrescribedByDoctor.LastName,
                    Specialization = p.PrescribedByDoctor.Specialization,
                },
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
            };
        }

        private ClinicalObservationDto MapObservationToDto(ClinicalObservation o)
        {
            return new ClinicalObservationDto
            {
                Id = o.Id,
                Gender = o.Gender,
                Age = o.Age,
                Height = o.Height,
                Weight = o.Weight,
                BloodPressure = o.BloodPressure,
                HeartRate = o.HeartRate,
                ObservationDate = o.ObservationDate,
                ObservationType = o.ObservationType,
                Value = o.Value,
                Notes = o.Notes,
                Client = new ClientBasicDto
                {
                    UserName = o.Client.UserName,
                    FirstName = o.Client.FirstName,
                    LastName = o.Client.LastName,
                },
                RecordedByDoctor = new DoctorBasicDto
                {
                    UserName = o.RecordedByDoctor.UserName,
                    FirstName = o.RecordedByDoctor.FirstName,
                    LastName = o.RecordedByDoctor.LastName,
                    Specialization = o.RecordedByDoctor.Specialization,
                },
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt,
            };
        }

        private RecommendationDto MapRecommendationToDto(Recommendation r)
        {
            return new RecommendationDto
            {
                Title = r.Title,
                Description = r.Description,
                DateGiven = r.DateGiven,
                IsActive = r.IsActive,
                Client = new ClientBasicDto
                {
                    UserName = r.Client.UserName,
                    FirstName = r.Client.FirstName,
                    LastName = r.Client.LastName,
                },
                Doctor = new DoctorBasicDto
                {
                    UserName = r.Doctor.UserName,
                    FirstName = r.Doctor.FirstName,
                    LastName = r.Doctor.LastName,
                    Specialization = r.Doctor.Specialization,
                },
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
            };
        }

        private ProgressDto MapProgressToDto(Progress p)
        {
            return new ProgressDto
            {
                Id = p.Id,
                Title = p.Title,
                Notes = p.Notes,
                DateRecorded = p.DateRecorded,
                ProgressStatus = p.ProgressStatus,
                Observations = p.Observations,
                Recommendations = p.Recommendations,
                ClientId = p.ClientId,
                RecordedByDoctorId = p.RecordedByDoctorId,
                DiagnosisId = p.DiagnosisId,
                TreatmentId = p.TreatmentId,
                ClientName = p.Client?.UserName ?? "Unknown",
                DoctorName = p.RecordedByDoctor?.UserName ?? "Unknown",
                DiagnosisName = p.Diagnosis?.Title ?? "No Diagnosis",
                TreatmentName = p.Treatment?.Title ?? "No Treatment",
            };
        }
    }
}
