using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalYearProject.Models
{
    public class Diagnosis
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? DiagnosisCode { get; set; } // ICD-10 or similar codes

        [Range(1, 5)]
        public int Severity { get; set; } = 1; // 1 = Mild, 5 = Critical

        [MaxLength(20)]
        public string Status { get; set; } = "Active"; // Active, Resolved, Under Investigation

        public string? TreatmentPlan { get; set; }
        
        public string? Notes { get; set; }

        public DateTime DateDiagnosed { get; set; } = DateTime.UtcNow;
        
        public DateTime? DateResolved { get; set; }

        public bool IsActive { get; set; } = true;

        // Foreign keys
        [Required]
        public int ClientId { get; set; }

        [Required]
        public int DiagnosedByDoctorId { get; set; }

        // Navigation properties
        public Client Client { get; set; } = null!;
        public Doctor DiagnosedByDoctor { get; set; } = null!;

        // Related symptoms (optional - if you want to link diagnoses to specific symptoms)
        public ICollection<Symptom>? RelatedSymptoms { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}