using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalYearProject.Models
{
    public class ClinicalObservation
    {
        [Key]
        public int Id { get; set; }

        // Demographic and vitals info
        public string? Gender { get; set; }
        public int? Age { get; set; }
        public double? Height { get; set; }   // in cm
        public double? Weight { get; set; }   // in kg
        public string? BloodPressure { get; set; } // e.g. "120/80 mmHg"
        public int? HeartRate { get; set; }   // bpm

        public DateTime ObservationDate { get; set; } = DateTime.UtcNow;

        // General observation details
        [Required]
        [MaxLength(200)]
        public string ObservationType { get; set; } = string.Empty;

        [Required]
        public string Value { get; set; } = string.Empty;

        public string? Notes { get; set; }

        // Foreign keys
        [Required]
        public int ClientId { get; set; }

        [Required]
        public int RecordedByDoctorId { get; set; }

        // Navigation properties
        public Client Client { get; set; } = null!;
        public Doctor RecordedByDoctor { get; set; } = null!;

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
