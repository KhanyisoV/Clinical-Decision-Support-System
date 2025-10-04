using System.ComponentModel.DataAnnotations;

// Create this file as: DTOs/DTOs.cs or Models/DTOs.cs in your project
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
        [MaxLength(100)]
        public string UserName { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
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
        public string UserName { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }

    // Doctor DTOs
    public class DoctorDto
    {
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
        public string UserName { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Specialization { get; set; }
    }

    // Symptom DTOs
    public class SymptomDto
    {
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
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Range(1, 10)]
        public int SeverityLevel { get; set; } = 1;
        
        public string? Notes { get; set; }
        
        [Required]
        public int ClientId { get; set; }
        
        [Required]
        public int AddedByDoctorId { get; set; }
    }

    public class SymptomUpdateDto
    {
        [MaxLength(200)]
        public string? Name { get; set; }
        
        public string? Description { get; set; }
        
        [Range(1, 10)]
        public int? SeverityLevel { get; set; }
        
        public DateTime? DateResolved { get; set; }
        public bool? IsActive { get; set; }
        public string? Notes { get; set; }
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

    // Extended DTO for viewing appointment with its history
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
        
        // Related data
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
        
        // Foreign keys
        public int ClientId { get; set; }
        public int RecordedByDoctorId { get; set; }
        public int? DiagnosisId { get; set; }
        public int? TreatmentId { get; set; }
        
        // Navigation properties for display
        public ClientBasicDto Client { get; set; } = null!;
        public DoctorBasicDto RecordedByDoctor { get; set; } = null!;
        public DiagnosisDto? Diagnosis { get; set; }
        public TreatmentSummaryDto? Treatment { get; set; }
        
        // Alternative names for backward compatibility
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

    // Summary DTO for listing treatments
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
    
    // Diagnosis DTOs
    public class DiagnosisDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? DiagnosisCode { get; set; }
        public int Severity { get; set; } = 1;
        public string Status { get; set; } = "Active";
        public string? TreatmentPlan { get; set; }
        public string? Notes { get; set; }
        public DateTime DateDiagnosed { get; set; }
        public DateTime? DateResolved { get; set; }
        public bool IsActive { get; set; } = true;
        public ClientBasicDto Client { get; set; } = null!;
        public DoctorBasicDto DiagnosedByDoctor { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class DiagnosisCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string? DiagnosisCode { get; set; }
        
        [Range(1, 5)]
        public int Severity { get; set; } = 1;
        
        [MaxLength(20)]
        public string Status { get; set; } = "Active";
        
        public string? TreatmentPlan { get; set; }
        public string? Notes { get; set; }
        
        [Required]
        public int ClientId { get; set; }
        
        [Required]
        public int DiagnosedByDoctorId { get; set; }
    }

    public class DiagnosisUpdateDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }
        
        public string? Description { get; set; }
        
        [MaxLength(50)]
        public string? DiagnosisCode { get; set; }
        
        [Range(1, 5)]
        public int? Severity { get; set; }
        
        [MaxLength(20)]
        public string? Status { get; set; }
        
        public string? TreatmentPlan { get; set; }
        public string? Notes { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? DateResolved { get; set; }
    }

    // Authentication DTOs
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

    // General DTOs for responses
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

    // For backward compatibility with existing code
    public class RegisterRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }


    public class ClinicalObservationDto
    {
        public int Id { get; set; }

        public string? Gender { get; set; }
        public int? Age { get; set; }
        public double? Height { get; set; }   // cm
        public double? Weight { get; set; }   // kg
        public string? BloodPressure { get; set; } // e.g. "120/80 mmHg"
        public int? HeartRate { get; set; }   // bpm
        public DateTime ObservationDate { get; set; }

        public string ObservationType { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Notes { get; set; }

        // Navigation summaries
        public ClientBasicDto Client { get; set; } = null!;
        public DoctorBasicDto RecordedByDoctor { get; set; } = null!;

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    // DTO for creating a new observation
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

    // DTO for updating an observation
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
}