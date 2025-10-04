using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalYearProject.Models
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Scheduled"; // Scheduled, Completed, Cancelled, Rescheduled

        [MaxLength(100)]
        public string? Location { get; set; }

        public string? Notes { get; set; }

        // Foreign keys
        [Required]
        public int ClientId { get; set; }

        [Required]
        public int DoctorId { get; set; }

        // Navigation properties
        public Client Client { get; set; } = null!;
        public Doctor Doctor { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}