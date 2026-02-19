using System.ComponentModel.DataAnnotations;

namespace FinalYearProject.Models
{
    public class Recommendation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public DateTime DateGiven { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        // Foreign Keys
        [Required]
        public int ClientId { get; set; }

        [Required]
        public int DoctorId { get; set; }

        // Navigation Properties
        public Client Client { get; set; } = null!;
        public Doctor Doctor { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
