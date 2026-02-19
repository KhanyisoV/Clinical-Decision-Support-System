using System.ComponentModel.DataAnnotations;

namespace FinalYearProject.Models
{
    public class Doctor : IUser
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = "Doctor";

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Specialization { get; set; }
        public string? LicenseNumber { get; set; }

        // Navigation properties
        public ICollection<Client> AssignedClients { get; set; } = new List<Client>();
        public ICollection<Symptom> SymptomsAdded { get; set; } = new List<Symptom>();
        public ICollection<Diagnosis> DiagnosesMade { get; set; } = new List<Diagnosis>();
        public ICollection<Recommendation> RecommendationsGiven { get; set; } = new List<Recommendation>();
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<Prescription> PrescriptionsGiven { get; set; } = new List<Prescription>();
        public ICollection<Treatment> TreatmentsProvided { get; set; } = new List<Treatment>(); // THIS LINE IS CRITICAL

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}