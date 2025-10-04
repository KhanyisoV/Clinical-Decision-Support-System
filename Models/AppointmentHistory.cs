using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalYearProject.Models
{
    public class AppointmentHistory
    {
        [Key]
        public int Id { get; set; }

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

        [Required]
        [MaxLength(100)]
        public string ChangedBy { get; set; } = string.Empty; 

        [Required]
        [MaxLength(20)]
        public string ChangedByRole { get; set; } = string.Empty; 

        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("AppointmentId")]
        public Appointment Appointment { get; set; } = null!;
    }
}