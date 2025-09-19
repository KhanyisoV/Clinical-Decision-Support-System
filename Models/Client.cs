using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalYearProject.Models
{
    public class Client : IUser
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = "Client";

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public DateTime? DateOfBirth { get; set; }

        // Foreign key for assigned doctor (nullable)
        public int? AssignedDoctorId { get; set; }

        // Navigation property - made nullable to fix warning
        public Doctor? AssignedDoctor { get; set; }

        // Navigation property for symptoms
        public ICollection<Symptom> Symptoms { get; set; } = new List<Symptom>();

        // Navigation property for diagnoses
        public ICollection<Diagnosis> Diagnoses { get; set; } = new List<Diagnosis>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}