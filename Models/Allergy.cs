using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalYearProject.Models
{
    public class Allergy
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ClientId { get; set; }

        [ForeignKey("ClientId")]
        public Client Client { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string AllergyName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string AllergyType { get; set; } = string.Empty; // e.g., "Food", "Drug", "Environmental", "Insect"

        [Required]
        [MaxLength(50)]
        public string Severity { get; set; } = "Mild"; // Mild, Moderate, Severe, Life-threatening

        [MaxLength(500)]
        public string Reaction { get; set; } = string.Empty; // e.g., "Hives", "Swelling", "Difficulty breathing"

        [MaxLength(1000)]
        public string Notes { get; set; } = string.Empty;

        public DateTime DiagnosedDate { get; set; }

        public bool IsActive { get; set; } = true; // Whether the allergy is still relevant

        [MaxLength(200)]
        public string? Treatment { get; set; } // e.g., "Carry EpiPen", "Avoid contact"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [Required]
        [MaxLength(100)]
        public string CreatedBy { get; set; } = string.Empty; // Username of user who created it

        [Required]
        [MaxLength(50)]
        public string CreatedByRole { get; set; } = string.Empty; // "Client" or "Doctor"
    }
}