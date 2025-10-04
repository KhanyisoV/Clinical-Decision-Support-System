using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalYearProject.Models
{
    public class Prescription
    {
        [Key]
        public int Id { get; set; }

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
        public string Status { get; set; } = "Active"; // Active, Completed, Discontinued

        public bool IsActive { get; set; } = true;

        // Foreign Keys
        [Required]
        public int ClientId { get; set; }

        [Required]
        public int PrescribedByDoctorId { get; set; }

        // Navigation Properties
        [ForeignKey("ClientId")]
        public Client Client { get; set; } = null!;

        [ForeignKey("PrescribedByDoctorId")]
        public Doctor PrescribedByDoctor { get; set; } = null!;

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}