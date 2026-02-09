using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalYearProject.Models
{
    public class LabResult
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ClientId { get; set; }

        [ForeignKey("ClientId")]
        public Client Client { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string TestName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string TestType { get; set; } = string.Empty; // e.g., "Blood Test", "Urine Test", "X-Ray"

        public DateTime TestDate { get; set; }

        [MaxLength(500)]
        public string Result { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Status { get; set; } = "Pending"; // Pending, Completed, Reviewed

        [MaxLength(1000)]
        public string Notes { get; set; } = string.Empty;

        [MaxLength(100)]
        public string ReferenceRange { get; set; } = string.Empty; // e.g., "70-100 mg/dL"

        public bool IsAbnormal { get; set; } = false;

        [MaxLength(200)]
        public string? PerformedBy { get; set; } // Lab technician or facility name

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [Required]
        [MaxLength(100)]
        public string CreatedByAdmin { get; set; } = string.Empty; // Username of admin who created it
    }
}