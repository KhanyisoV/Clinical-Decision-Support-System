using System.ComponentModel.DataAnnotations;

namespace FinalYearProject.DTOs
{
    // Admin DTOs
    public class AdminDto
    {
        public string UserName { get; set; } = string.Empty;
        public string Role { get; set; } = "Admin";
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class AdminCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string UserName { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        
        [EmailAddress]
        public string? Email { get; set; }
    }

    public class AdminUpdateDto
    {
        [MaxLength(100)]
        public string? UserName { get; set; }
        
        [MinLength(6)]
        public string? Password { get; set; }
        
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        
        [EmailAddress]
        public string? Email { get; set; }
    }

    // Client DTOs
    public class ClientDto
    {   
        public int Id { get; set; } 
        public string UserName { get; set; } = string.Empty;
        public string Role { get; set; } = "Client";
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DoctorBasicDto? AssignedDoctor { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ClientCreateDto
    {
        [Required]
        public string UserName { get; set; }
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; }
        
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        
        [EmailAddress]
        public string? Email { get; set; }
        
        public DateTime? DateOfBirth { get; set; }
        
        public int? AssignedDoctorId { get; set; }
    }

    public class ClientUpdateDto
    {
        [MaxLength(100)]
        public string? UserName { get; set; }
        
        [MinLength(6)]
        public string? Password { get; set; }
        
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        
        [EmailAddress]
        public string? Email { get; set; }
        
        public DateTime? DateOfBirth { get; set; }
        public int? AssignedDoctorId { get; set; }
    }

    // Basic client info for nested objects
    public class ClientBasicDto
    {   
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }

    //message DTO
     public class MessageCreateDto
    {
        public string ReceiverUsername { get; set; } = string.Empty;
        public string ReceiverRole { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }

    public class MessageDto
    {
        public int Id { get; set; }
        public string SenderUsername { get; set; } = string.Empty;
        public string SenderRole { get; set; } = string.Empty;
        public string SenderFullName { get; set; } = string.Empty;
        public string ReceiverUsername { get; set; } = string.Empty;
        public string ReceiverRole { get; set; } = string.Empty;
        public string ReceiverFullName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime SentAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public string ConversationId { get; set; } = string.Empty;
    }

    public class ConversationDto
    {
        public string ConversationId { get; set; } = string.Empty;
        public string OtherUserUsername { get; set; } = string.Empty;
        public string OtherUserFullName { get; set; } = string.Empty;
        public string OtherUserRole { get; set; } = string.Empty;
        public string LastMessage { get; set; } = string.Empty;
        public DateTime LastMessageTime { get; set; }
        public int UnreadCount { get; set; }
    }

    // Doctor DTOs
    public class DoctorDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Role { get; set; } = "Doctor";
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Specialization { get; set; }
        public string? LicenseNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class DoctorCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string UserName { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        
        [EmailAddress]
        public string? Email { get; set; }
        
        public string? Specialization { get; set; }
        public string? LicenseNumber { get; set; }
    }

    public class DoctorUpdateDto
    {
        [MaxLength(100)]
        public string? UserName { get; set; }
        
        [MinLength(6)]
        public string? Password { get; set; }
        
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        
        [EmailAddress]
        public string? Email { get; set; }
        
        public string? Specialization { get; set; }
        public string? LicenseNumber { get; set; }
    }

    // Basic doctor info for nested objects
    public class DoctorBasicDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Specialization { get; set; }
    }

    // Symptom DTOs
    public class SymptomDto
    {   public int Id { get; set; }
        public int ClientId { get; set; }           
        public string ClientUserName { get; set; } = null!;   // ADD THIS
        public string AddedByDoctorUserName { get; set; } = null!;   // ADD THIS
        public int AddedByDoctorId { get; set; } 
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int SeverityLevel { get; set; } = 1;
        public DateTime DateReported { get; set; }
        public DateTime? DateResolved { get; set; }
        public bool IsActive { get; set; } = true;
        public string? Notes { get; set; }
        public ClientBasicDto Client { get; set; } = null!;
        public DoctorBasicDto AddedByDoctor { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

   public class SymptomCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Range(1, 10)]
        public int SeverityLevel { get; set; } = 1;
        
        // Support either ID or Username
        public int ClientId { get; set; }
        public string? ClientUsername { get; set; }
        
        public int DoctorId { get; set; }
        public int AddedByDoctorId { get; set; }  // ← ADD THIS
        public string? DoctorUsername { get; set; }
        
        public string? Notes { get; set; }
    }
    public class SymptomUpdateDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        
        [Range(1, 10)]
        public int? SeverityLevel { get; set; }
        
        public string? Notes { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? DateResolved { get; set; }
    }

    public class PrescriptionDto
    {
        public int Id { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Instructions { get; set; }
        public string? Notes { get; set; }
        public string Status { get; set; } = "Active";
        public bool IsActive { get; set; }
        public ClientBasicDto Client { get; set; } = null!;
        public DoctorBasicDto PrescribedByDoctor { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class PrescriptionCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string MedicationName { get; set; } = string.Empty;

        [Required]
        public string Dosage { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Frequency { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string? Instructions { get; set; }

        public string? Notes { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Active";

        [Required]
        public int ClientId { get; set; }

        [Required]
        public int PrescribedByDoctorId { get; set; }
    }

    public class PrescriptionUpdateDto
    {
        [MaxLength(200)]
        public string? MedicationName { get; set; }

        public string? Dosage { get; set; }

        [MaxLength(100)]
        public string? Frequency { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string? Instructions { get; set; }

        public string? Notes { get; set; }

        [MaxLength(50)]
        public string? Status { get; set; }

        public bool? IsActive { get; set; }
    }

    public class AppointmentHistoryDto
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public string AppointmentTitle { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public string PreviousStatus { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public string? ChangeReason { get; set; }
        public string? Notes { get; set; }
        public string ChangedBy { get; set; } = string.Empty;
        public string ChangedByRole { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; }
        public ClientBasicDto Client { get; set; } = null!;
        public DoctorBasicDto Doctor { get; set; } = null!;
    }

    public class AppointmentHistoryCreateDto
    {
        [Required]
        public int AppointmentId { get; set; }

        [Required]
        [MaxLength(50)]
        public string PreviousStatus { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string NewStatus { get; set; } = string.Empty;

        public string? ChangeReason { get; set; }

        public string? Notes { get; set; }
    }

    public class AppointmentWithHistoryDto
    {
        public AppointmentDto Appointment { get; set; } = null!;
        public List<AppointmentHistoryDto> History { get; set; } = new List<AppointmentHistoryDto>();
    }

    public class AppointmentDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Status { get; set; } = "Scheduled";
        public string? Location { get; set; }
        public string? Notes { get; set; }
        public ClientBasicDto Client { get; set; } = null!;
        public DoctorBasicDto Doctor { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class AppointmentCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Scheduled";

        [MaxLength(100)]
        public string? Location { get; set; }

        public string? Notes { get; set; }

        [Required]
        public int ClientId { get; set; }

        [Required]
        public int DoctorId { get; set; }
    }

    public class AppointmentUpdateDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        public string? Description { get; set; }

        public DateTime? AppointmentDate { get; set; }

        public TimeSpan? StartTime { get; set; }

        public TimeSpan? EndTime { get; set; }

        [MaxLength(50)]
        public string? Status { get; set; }

        [MaxLength(100)]
        public string? Location { get; set; }

        public string? Notes { get; set; }

        public int? ClientId { get; set; }

        public int? DoctorId { get; set; }
    }

    public class TreatmentDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; } = "Active";
        public string? TreatmentPlan { get; set; }
        public string? Goals { get; set; }
        public string? ProgressNotes { get; set; }
        public int? PrescriptionId { get; set; }
        public int? NextAppointmentId { get; set; }
        public int? DiagnosisId { get; set; }
        
        public PrescriptionDto? Prescription { get; set; }
        public AppointmentDto? NextAppointment { get; set; }
        public DiagnosisDto? Diagnosis { get; set; }
        
        public ClientBasicDto Client { get; set; } = null!;
        public DoctorBasicDto ProvidedByDoctor { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class TreatmentCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Active";

        public string? TreatmentPlan { get; set; }

        public string? Goals { get; set; }

        public string? ProgressNotes { get; set; }

        public int? PrescriptionId { get; set; }

        public int? NextAppointmentId { get; set; }

        public int? DiagnosisId { get; set; }

        [Required]
        public int ClientId { get; set; }

        [Required]
        public int ProvidedByDoctorId { get; set; }
    }

    public class TreatmentUpdateDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        public string? Description { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [MaxLength(50)]
        public string? Status { get; set; }

        public string? TreatmentPlan { get; set; }

        public string? Goals { get; set; }

        public string? ProgressNotes { get; set; }

        public int? PrescriptionId { get; set; }

        public int? NextAppointmentId { get; set; }

        public int? DiagnosisId { get; set; }
    }

    public class ProgressDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime DateRecorded { get; set; }
        public string ProgressStatus { get; set; } = "In Progress";
        public string? Observations { get; set; }
        public string? Recommendations { get; set; }
        
        public int ClientId { get; set; }
        public int RecordedByDoctorId { get; set; }
        public int? DiagnosisId { get; set; }
        public int? TreatmentId { get; set; }
        
        public ClientBasicDto Client { get; set; } = null!;
        public DoctorBasicDto RecordedByDoctor { get; set; } = null!;
        public DiagnosisDto? Diagnosis { get; set; }
        public TreatmentSummaryDto? Treatment { get; set; }
        
        public string ClientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string? DiagnosisName { get; set; }
        public string? TreatmentName { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ProgressCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Notes { get; set; } = string.Empty;
        
        [Required]
        public DateTime DateRecorded { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string ProgressStatus { get; set; } = "In Progress";
        
        public string? Observations { get; set; }
        public string? Recommendations { get; set; }
        
        [Required]
        public int ClientId { get; set; }
        
        [Required]
        public int RecordedByDoctorId { get; set; }
        
        public int? DiagnosisId { get; set; }
        public int? TreatmentId { get; set; }
    }

    public class ProgressUpdateDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }
        
        public string? Notes { get; set; }
        
        public DateTime? DateRecorded { get; set; }
        
        [MaxLength(50)]
        public string? ProgressStatus { get; set; }
        
        public string? Observations { get; set; }
        public string? Recommendations { get; set; }
        
        public int? DiagnosisId { get; set; }
        public int? TreatmentId { get; set; }
    }

    public class TreatmentSummaryDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; } = "Active";
        public ClientBasicDto Client { get; set; } = null!;
        public DoctorBasicDto ProvidedByDoctor { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }

    public class ClientHistoryDto
    {
        public ClientDto Client { get; set; } = null!;
        public List<DiagnosisDto> Diagnoses { get; set; } = new();
        public List<TreatmentDto> Treatments { get; set; } = new();
        public List<AppointmentDto> Appointments { get; set; } = new();
        public List<PrescriptionDto> Prescriptions { get; set; } = new();
        public List<SymptomDto> Symptoms { get; set; } = new();
        public List<ClinicalObservationDto> ClinicalObservations { get; set; } = new();
        public List<RecommendationDto> Recommendations { get; set; } = new();
        public List<ProgressDto> ProgressRecords { get; set; } = new();
        public ClientHistorySummaryDto Summary { get; set; } = null!;
    }

    public class ClientHistorySummaryDto
    {
        public int TotalDiagnoses { get; set; }
        public int ActiveDiagnoses { get; set; }
        public int TotalTreatments { get; set; }
        public int ActiveTreatments { get; set; }
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int UpcomingAppointments { get; set; }
        public int TotalPrescriptions { get; set; }
        public int ActivePrescriptions { get; set; }
        public int TotalSymptoms { get; set; }
        public int ActiveSymptoms { get; set; }
        public int TotalObservations { get; set; }
        public int TotalRecommendations { get; set; }
        public int TotalProgressRecords { get; set; }
        public DateTime? LastAppointmentDate { get; set; }
        public DateTime? NextAppointmentDate { get; set; }
        public DateTime? LastObservationDate { get; set; }
        public List<string> CurrentDoctors { get; set; } = new();
    }

    public class ClientTimelineEventDto
    {
        public DateTime EventDate { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Status { get; set; }
        public string? DoctorName { get; set; }
        public int? RelatedId { get; set; }
    }

    public class ClientHistoryFilterDto
    {
        public int ClientId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<string>? EventTypes { get; set; }
        public bool IncludeInactive { get; set; } = false;
        public int? DoctorId { get; set; }
    }

    public class DiagnosisCreateDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string? DiagnosisCode { get; set; }

        [Range(1, 5)]
        public int Severity { get; set; } = 1;

        public string? Status { get; set; } = "Active";

        public string? TreatmentPlan { get; set; }

        public string? Notes { get; set; }

        // Support either ID or Username
        public int ClientId { get; set; }
        public string? ClientUsername { get; set; }

        public int DoctorId { get; set; }
        public int DiagnosedByDoctorId { get; set; }  // ← ADD THIS
        public string? DoctorUsername { get; set; }
    }
    public class DiagnosisUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? DiagnosisCode { get; set; }

        [Range(1, 5)]
        public int? Severity { get; set; }

        public string? Status { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? Notes { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? DateResolved { get; set; }
    }

    public class DiagnosisDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? DiagnosisCode { get; set; }
        public int Severity { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? TreatmentPlan { get; set; }
        public string? Notes { get; set; }
        public DateTime DateDiagnosed { get; set; }
        public DateTime? DateResolved { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }  // ← Make this nullable with ?
        
        public int ClientId { get; set; }
        public ClientBasicDto? Client { get; set; }
        
        public int DiagnosedByDoctorId { get; set; }
        public DoctorBasicDto? DiagnosedByDoctor { get; set; }
    }
    public class ClientAnalyticsDto
    {
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public DateTime AnalysisPeriodStart { get; set; }
        public DateTime AnalysisPeriodEnd { get; set; }
        
        public ClinicalObservationTrendsDto ClinicalObservationTrends { get; set; } = new();
        public SymptomAnalyticsDto SymptomAnalytics { get; set; } = new();
        public AppointmentAnalyticsDto AppointmentAnalytics { get; set; } = new();
        public TreatmentProgressDto TreatmentProgress { get; set; } = new();
        public OverallHealthScoreDto HealthScore { get; set; } = new();
    }

    public class ClinicalObservationTrendsDto
    {
        public List<DataPointDto> WeightTrend { get; set; } = new();
        public List<DataPointDto> HeightTrend { get; set; } = new();
        public List<DataPointDto> BloodPressureSystolicTrend { get; set; } = new();
        public List<DataPointDto> BloodPressureDiastolicTrend { get; set; } = new();
        public List<DataPointDto> HeartRateTrend { get; set; } = new();
        public List<DataPointDto> BMITrend { get; set; } = new();
        
        public VitalStatisticsDto WeightStats { get; set; } = new();
        public VitalStatisticsDto HeartRateStats { get; set; } = new();
        public VitalStatisticsDto BMIStats { get; set; } = new();
    }

    public class SymptomAnalyticsDto
    {
        public int TotalSymptoms { get; set; }
        public int ActiveSymptoms { get; set; }
        public int ResolvedSymptoms { get; set; }
        public double ResolutionRate { get; set; }
        public double AverageResolutionTimeInDays { get; set; }
        
        public List<SymptomTrendDto> SymptomIntensityTrends { get; set; } = new();
        public List<SymptomCategoryDto> SymptomsByCategory { get; set; } = new();
        public List<SymptomFrequencyDto> MostCommonSymptoms { get; set; } = new();
    }

    public class SymptomTrendDto
    {
        public string SymptomName { get; set; } = string.Empty;
        public List<DataPointDto> IntensityOverTime { get; set; } = new();
        public string Status { get; set; } = string.Empty;
    }

    public class SymptomCategoryDto
    {
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class SymptomFrequencyDto
    {
        public string SymptomName { get; set; } = string.Empty;
        public int Occurrences { get; set; }
        public double AverageSeverity { get; set; }
    }

    public class AppointmentAnalyticsDto
    {
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int CancelledAppointments { get; set; }
        public int MissedAppointments { get; set; }
        public double AttendanceRate { get; set; }
        
        public List<DataPointDto> AppointmentFrequency { get; set; } = new();
        public List<AppointmentTypeDistributionDto> AppointmentsByType { get; set; } = new();
        public double AverageDaysBetweenAppointments { get; set; }
        public DateTime? NextScheduledAppointment { get; set; }
    }

    public class AppointmentTypeDistributionDto
    {
        public string Type { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class TreatmentProgressDto
    {
        public int ActiveTreatments { get; set; }
        public int CompletedTreatments { get; set; }
        public double CompletionRate { get; set; }
        
        public List<TreatmentProgressItemDto> TreatmentProgressItems { get; set; } = new();
        public List<DataPointDto> OverallProgressTrend { get; set; } = new();
    }

    public class TreatmentProgressItemDto
    {
        public int TreatmentId { get; set; }
        public string TreatmentName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int ProgressPercentage { get; set; }
        public List<DataPointDto> ProgressHistory { get; set; } = new();
    }

    public class OverallHealthScoreDto
    {
        public int CurrentScore { get; set; }
        public int PreviousScore { get; set; }
        public int ScoreChange { get; set; }
        public string Trend { get; set; } = "Stable";
        public List<HealthFactorDto> Factors { get; set; } = new();
    }

    public class HealthFactorDto
    {
        public string Name { get; set; } = string.Empty;
        public int Score { get; set; }
        public string Impact { get; set; } = string.Empty;
    }

    public class DataPointDto
    {
        public DateTime Date { get; set; }
        public double Value { get; set; }
        public string? Label { get; set; }
        public string? Category { get; set; }
    }

    public class VitalStatisticsDto
    {
        public double Current { get; set; }
        public double Average { get; set; }
        public double Min { get; set; }
        public double Max { get; set; }
        public double Change { get; set; }
        public string Trend { get; set; } = "Stable";
    }

    public class AnalyticsFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? GroupBy { get; set; }
        public List<string>? MetricTypes { get; set; }
    }

    public class LoginDto
    {
        [Required]
        public string UserName { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public bool Success { get; set; }
    }

    public class ApiResponseDto<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }
    }

    public class ApiResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string>? Errors { get; set; }
    }

    public class RegisterRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LabResultDto
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string TestName { get; set; } = string.Empty;
        public string TestType { get; set; } = string.Empty;
        public DateTime TestDate { get; set; }
        public string Result { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string ReferenceRange { get; set; } = string.Empty;
        public bool IsAbnormal { get; set; }
        public string? PerformedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string CreatedByAdmin { get; set; } = string.Empty;
    }

    public class LabResultCreateDto
    {
        [Required]
        public int ClientId { get; set; }

        [Required]
        [MaxLength(200)]
        public string TestName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string TestType { get; set; } = string.Empty;

        [Required]
        public DateTime TestDate { get; set; }

        [MaxLength(500)]
        public string Result { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Status { get; set; } = "Pending";

        [MaxLength(1000)]
        public string Notes { get; set; } = string.Empty;

        [MaxLength(100)]
        public string ReferenceRange { get; set; } = string.Empty;

        public bool IsAbnormal { get; set; } = false;

        [MaxLength(200)]
        public string? PerformedBy { get; set; }
    }

    public class LabResultUpdateDto
    {
        [MaxLength(200)]
        public string? TestName { get; set; }

        [MaxLength(100)]
        public string? TestType { get; set; }

        public DateTime? TestDate { get; set; }

        [MaxLength(500)]
        public string? Result { get; set; }

        [MaxLength(100)]
        public string? Status { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        [MaxLength(100)]
        public string? ReferenceRange { get; set; }

        public bool? IsAbnormal { get; set; }

        [MaxLength(200)]
        public string? PerformedBy { get; set; }
    }

    public class PredictionHistoryDto
    {
        public int Id { get; set; }
        public int MLPredictionId { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string PredictedDiagnosis { get; set; } = string.Empty;
        public double ConfidenceScore { get; set; }
        public string? Symptoms { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? ActualDiagnosisId { get; set; }
        public string? ActualDiagnosisName { get; set; }
        public bool WasAccurate { get; set; }
        public string? Notes { get; set; }
        public DateTime PredictedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewedByDoctorName { get; set; }
    }

    public class PredictionHistoryCreateDto
    {
        [Required]
        public int MLPredictionId { get; set; }

        [Required]
        public int ClientId { get; set; }

        [Required]
        [MaxLength(200)]
        public string PredictedDiagnosis { get; set; } = string.Empty;

        [Required]
        [Range(0, 1)]
        public double ConfidenceScore { get; set; }

        [MaxLength(500)]
        public string? Symptoms { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    public class PredictionHistoryUpdateDto
    {
        [MaxLength(50)]
        public string? Status { get; set; }

        public int? ActualDiagnosisId { get; set; }

        [MaxLength(200)]
        public string? ActualDiagnosisName { get; set; }

        public bool? WasAccurate { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    public class PredictionAccuracyStatsDto
    {
        public int TotalPredictions { get; set; }
        public int ReviewedPredictions { get; set; }
        public int AccuratePredictions { get; set; }
        public int InaccuratePredictions { get; set; }
        public double AccuracyRate { get; set; }
        public Dictionary<string, int> PredictionsByStatus { get; set; } = new();
        public Dictionary<string, int> TopPredictedConditions { get; set; } = new();
    }

    public class MLPredictionDto
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string PredictedDiagnosis { get; set; } = string.Empty;
        public double ConfidenceScore { get; set; }
        public string? Symptoms { get; set; }
        public string? AdditionalNotes { get; set; }
        public bool IsReviewedByDoctor { get; set; }
        public string? ReviewedByDoctorName { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? DoctorFeedback { get; set; }
        public int? DiagnosisId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class MLPredictionCreateDto
    {
        [Required]
        public int ClientId { get; set; }

        [Required]
        [MaxLength(200)]
        public string PredictedDiagnosis { get; set; } = string.Empty;

        [Required]
        [Range(0, 1)]
        public double ConfidenceScore { get; set; }

        [MaxLength(500)]
        public string? Symptoms { get; set; }

        [MaxLength(1000)]
        public string? AdditionalNotes { get; set; }
    }

    public class MLPredictionReviewDto
    {
        [Required]
        [MaxLength(500)]
        public string DoctorFeedback { get; set; } = string.Empty;

        public int? DiagnosisId { get; set; }
    }

    public class AllergyDto
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string AllergyName { get; set; } = string.Empty;
        public string AllergyType { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Reaction { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime DiagnosedDate { get; set; }
        public bool IsActive { get; set; }
        public string? Treatment { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedByRole { get; set; } = string.Empty;
    }

    public class AllergyCreateDto
    {
        [Required]
        public int ClientId { get; set; }

        [Required]
        [MaxLength(200)]
        public string AllergyName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string AllergyType { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Severity { get; set; } = "Mild";

        [MaxLength(500)]
        public string Reaction { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Notes { get; set; } = string.Empty;

        [Required]
        public DateTime DiagnosedDate { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(200)]
        public string? Treatment { get; set; }
    }

    public class AllergyUpdateDto
    {
        [MaxLength(200)]
        public string? AllergyName { get; set; }

        [MaxLength(100)]
        public string? AllergyType { get; set; }

        [MaxLength(50)]
        public string? Severity { get; set; }

        [MaxLength(500)]
        public string? Reaction { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        public DateTime? DiagnosedDate { get; set; }

        public bool? IsActive { get; set; }

        [MaxLength(200)]
        public string? Treatment { get; set; }
    }

    public class ClinicalObservationDto
    {
        public int Id { get; set; }
        public string? Gender { get; set; }
        public int? Age { get; set; }
        public double? Height { get; set; }
        public double? Weight { get; set; }
        public string? BloodPressure { get; set; }
        public int? HeartRate { get; set; }
        public DateTime ObservationDate { get; set; }
        public string ObservationType { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public ClientBasicDto Client { get; set; } = null!;
        public DoctorBasicDto RecordedByDoctor { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ClinicalObservationCreateDto
    {
        [Required]
        public string? Gender { get; set; }

        [Required]
        public int? Age { get; set; }

        public double? Height { get; set; }
        public double? Weight { get; set; }
        public string? BloodPressure { get; set; }
        public int? HeartRate { get; set; }

        [Required]
        public DateTime ObservationDate { get; set; }

        [Required]
        [MaxLength(200)]
        public string ObservationType { get; set; } = string.Empty;

        [Required]
        public string Value { get; set; } = string.Empty;

        public string? Notes { get; set; }

        [Required]
        public int ClientId { get; set; }

        [Required]
        public int RecordedByDoctorId { get; set; }
    }

    public class ClinicalObservationUpdateDto
    {
        public string? Gender { get; set; }
        public int? Age { get; set; }
        public double? Height { get; set; }
        public double? Weight { get; set; }
        public string? BloodPressure { get; set; }
        public int? HeartRate { get; set; }
        public DateTime? ObservationDate { get; set; }
        public string? ObservationType { get; set; }
        public string? Value { get; set; }
        public string? Notes { get; set; }
    }

    public class RecommendationDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DateGiven { get; set; }
        public bool IsActive { get; set; } = true;
        public ClientBasicDto Client { get; set; } = null!;
        public DoctorBasicDto Doctor { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class RecommendationCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int ClientId { get; set; }

        [Required]
        public int DoctorId { get; set; }
    }

    public class RecommendationUpdateDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
    }
}