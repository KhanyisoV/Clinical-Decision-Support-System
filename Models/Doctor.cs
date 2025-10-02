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
        public string Role { get; set; } = "Doctor"; // Required by IUser interface

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Specialization { get; set; }
        public string? LicenseNumber { get; set; }

        // Navigation properties
        public ICollection<Client> AssignedClients { get; set; } = new List<Client>();
        public ICollection<Symptom> SymptomsAdded { get; set; } = new List<Symptom>();
        public ICollection<Diagnosis> DiagnosesMade { get; set; } = new List<Diagnosis>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}