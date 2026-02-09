using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalYearProject.Models
{
    public class Progress
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Notes { get; set; } = string.Empty;

        [Required]
        public DateTime DateRecorded { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string ProgressStatus { get; set; } = "In Progress"; // Improving, Stable, Declining, In Progress

        public string? Observations { get; set; }

        public string? Recommendations { get; set; }

        // Foreign Keys
        [Required]
        public int ClientId { get; set; }

        [Required]
        public int RecordedByDoctorId { get; set; }

        public int? DiagnosisId { get; set; }

        public int? TreatmentId { get; set; }

        // Navigation Properties
        [ForeignKey("ClientId")]
        public Client Client { get; set; } = null!;

        [ForeignKey("RecordedByDoctorId")]
        public Doctor RecordedByDoctor { get; set; } = null!;

        [ForeignKey("DiagnosisId")]
        public Diagnosis? Diagnosis { get; set; }

        [ForeignKey("TreatmentId")]
        public Treatment? Treatment { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}