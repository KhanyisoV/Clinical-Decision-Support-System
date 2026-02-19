using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalYearProject.Models
{
    public class MLPrediction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ClientId { get; set; }
        
        [ForeignKey("ClientId")]
        public Client Client { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string PredictedDiagnosis { get; set; } = string.Empty;

        [Range(0, 1)]
        public double ConfidenceScore { get; set; }

        [MaxLength(500)]
        public string? Symptoms { get; set; }

        [MaxLength(1000)]
        public string? AdditionalNotes { get; set; }

        public bool IsReviewedByDoctor { get; set; } = false;

        public int? ReviewedByDoctorId { get; set; }
        
        [ForeignKey("ReviewedByDoctorId")]
        public Doctor? ReviewedByDoctor { get; set; }

        public DateTime? ReviewedAt { get; set; }

        [MaxLength(500)]
        public string? DoctorFeedback { get; set; }

        public int? DiagnosisId { get; set; }
        
        [ForeignKey("DiagnosisId")]
        public Diagnosis? Diagnosis { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}