using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalYearProject.Models
{
    public class PredictionHistory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MLPredictionId { get; set; }
        
        [ForeignKey("MLPredictionId")]
        public MLPrediction MLPrediction { get; set; } = null!;

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

        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Reviewed, Confirmed, Rejected

        public int? ActualDiagnosisId { get; set; }
        
        [ForeignKey("ActualDiagnosisId")]
        public Diagnosis? ActualDiagnosis { get; set; }

        [MaxLength(200)]
        public string? ActualDiagnosisName { get; set; }

        public bool WasAccurate { get; set; } = false;

        [MaxLength(1000)]
        public string? Notes { get; set; }

        [Required]
        public DateTime PredictedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReviewedAt { get; set; }

        public int? ReviewedByDoctorId { get; set; }
        
        [ForeignKey("ReviewedByDoctorId")]
        public Doctor? ReviewedByDoctor { get; set; }
    }
}
