using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalYearProject.Models
{
    public class Symptom
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Range(1, 10)]
        public int SeverityLevel { get; set; } = 1;

        public DateTime DateReported { get; set; } = DateTime.UtcNow;
        public DateTime? DateResolved { get; set; }

        public bool IsActive { get; set; } = true;

        public string? Notes { get; set; }

        // Foreign keys
        [Required]
        public int ClientId { get; set; }

        [Required]
        public int AddedByDoctorId { get; set; }

        // Navigation properties
        public Client Client { get; set; } = null!;
        public Doctor AddedByDoctor { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}