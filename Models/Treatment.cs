using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalYearProject.Models
{
    public class Treatment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Active"; // Active, Completed, Discontinued, On Hold

        public string? TreatmentPlan { get; set; }

        public string? Goals { get; set; }

        public string? ProgressNotes { get; set; }

        // References to related entities
        public int? PrescriptionId { get; set; }
        
        public int? NextAppointmentId { get; set; }

        public int? DiagnosisId { get; set; }

        // Foreign Keys
        [Required]
        public int ClientId { get; set; }

        [Required]
        public int ProvidedByDoctorId { get; set; }

        // Navigation Properties
        [ForeignKey("ClientId")]
        public Client Client { get; set; } = null!;

        [ForeignKey("ProvidedByDoctorId")]
        public Doctor ProvidedByDoctor { get; set; } = null!;

        [ForeignKey("PrescriptionId")]
        public Prescription? Prescription { get; set; }

        [ForeignKey("NextAppointmentId")]
        public Appointment? NextAppointment { get; set; }

        [ForeignKey("DiagnosisId")]
        public Diagnosis? Diagnosis { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}