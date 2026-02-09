using Microsoft.EntityFrameworkCore;
using FinalYearProject.Models;

namespace FinalYearProject.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Admin> Admins { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Symptom> Symptoms { get; set; }
        public DbSet<Diagnosis> Diagnoses { get; set; }
        public DbSet<ClinicalObservation> ClinicalObservations { get; set; }
        public DbSet<Recommendation> Recommendations { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<AppointmentHistory> AppointmentHistories { get; set; }
        public DbSet<Treatment> Treatments { get; set; }
        public DbSet<Progress> Progresses { get; set; }
        public DbSet<LabResult> LabResults { get; set; }
        public DbSet<Allergy> Allergies { get; set; }
        public DbSet<MLPrediction> MLPredictions { get; set; }
        public DbSet<PredictionHistory> PredictionHistories { get; set; }
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            // Configure PredictionHistory relationships to avoid cascade conflicts
            modelBuilder.Entity<PredictionHistory>()
                .HasOne(ph => ph.MLPrediction)
                .WithMany()
                .HasForeignKey(ph => ph.MLPredictionId)
                .OnDelete(DeleteBehavior.NoAction); // Changed from Cascade
             modelBuilder.Entity<Allergy>()
                .HasOne(a => a.Client)
                .WithMany()
                .HasForeignKey(a => a.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            // Add indexes for better query performance
            modelBuilder.Entity<Allergy>()
                .HasIndex(a => a.ClientId);

            modelBuilder.Entity<Allergy>()
                .HasIndex(a => a.AllergyType);

            modelBuilder.Entity<Allergy>()
                .HasIndex(a => a.Severity);

            modelBuilder.Entity<Allergy>()
                .HasIndex(a => a.IsActive);

            modelBuilder.Entity<Allergy>()
                .HasIndex(a => a.DiagnosedDate);

            //Configure LabResult relationships
            modelBuilder.Entity<LabResult>()
                .HasOne(lr => lr.Client)
                .WithMany()
                .HasForeignKey(lr => lr.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            // Add indexes for better query performance
            modelBuilder.Entity<LabResult>()
                .HasIndex(lr => lr.ClientId);

            modelBuilder.Entity<LabResult>()
                .HasIndex(lr => lr.TestDate);

            modelBuilder.Entity<LabResult>()
                .HasIndex(lr => lr.Status);

            // Configure Client-Doctor relationship
            modelBuilder.Entity<Client>()
                .HasOne(c => c.AssignedDoctor)
                .WithMany(d => d.AssignedClients)
                .HasForeignKey(c => c.AssignedDoctorId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure Symptom-Client relationship
            modelBuilder.Entity<Symptom>()
                .HasOne(s => s.Client)
                .WithMany(c => c.Symptoms)
                .HasForeignKey(s => s.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Symptom-Doctor relationship
            modelBuilder.Entity<Symptom>()
                .HasOne(s => s.AddedByDoctor)
                .WithMany(d => d.SymptomsAdded)
                .HasForeignKey(s => s.AddedByDoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Diagnosis-Client relationship
            modelBuilder.Entity<Diagnosis>()
                .HasOne(d => d.Client)
                .WithMany(c => c.Diagnoses)
                .HasForeignKey(d => d.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Diagnosis-Doctor relationship
            modelBuilder.Entity<Diagnosis>()
                .HasOne(d => d.DiagnosedByDoctor)
                .WithMany(doctor => doctor.DiagnosesMade)
                .HasForeignKey(d => d.DiagnosedByDoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure ClinicalObservation-Client relationship
            modelBuilder.Entity<ClinicalObservation>()
                .HasOne(co => co.Client)
                .WithMany()
                .HasForeignKey(co => co.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure ClinicalObservation-Doctor relationship
            modelBuilder.Entity<ClinicalObservation>()
                .HasOne(co => co.RecordedByDoctor)
                .WithMany()
                .HasForeignKey(co => co.RecordedByDoctorId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Configure Recommendation-Client relationship
            modelBuilder.Entity<Recommendation>()
                .HasOne(r => r.Client)
                .WithMany(c => c.Recommendations)
                .HasForeignKey(r => r.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Recommendation-Doctor relationship
            modelBuilder.Entity<Recommendation>()
                .HasOne(r => r.Doctor)
                .WithMany(d => d.RecommendationsGiven)
                .HasForeignKey(r => r.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Appointment-Client relationship
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Client)
                .WithMany(c => c.Appointments)
                .HasForeignKey(a => a.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Appointment-Doctor relationship
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany(d => d.Appointments)
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Prescription-Client relationship
            modelBuilder.Entity<Prescription>()
                .HasOne(p => p.Client)
                .WithMany(c => c.Prescriptions)
                .HasForeignKey(p => p.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Prescription-Doctor relationship
            modelBuilder.Entity<Prescription>()
                .HasOne(p => p.PrescribedByDoctor)
                .WithMany(d => d.PrescriptionsGiven)
                .HasForeignKey(p => p.PrescribedByDoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure AppointmentHistory-Appointment relationship
            modelBuilder.Entity<AppointmentHistory>()
                .HasOne(ah => ah.Appointment)
                .WithMany()
                .HasForeignKey(ah => ah.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            // ADD THESE LINES FOR TREATMENT
            // Configure Treatment-Client relationship
            modelBuilder.Entity<Treatment>()
                .HasOne(t => t.Client)
                .WithMany(c => c.Treatments)
                .HasForeignKey(t => t.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Treatment-Doctor relationship
            modelBuilder.Entity<Treatment>()
                .HasOne(t => t.ProvidedByDoctor)
                .WithMany(d => d.TreatmentsProvided)
                .HasForeignKey(t => t.ProvidedByDoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Treatment-Prescription relationship (optional)
            modelBuilder.Entity<Treatment>()
                .HasOne(t => t.Prescription)
                .WithMany()
                .HasForeignKey(t => t.PrescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Treatment-NextAppointment relationship (optional)
            modelBuilder.Entity<Treatment>()
                .HasOne(t => t.NextAppointment)
                .WithMany()
                .HasForeignKey(t => t.NextAppointmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Treatment-Diagnosis relationship (optional)
            modelBuilder.Entity<Treatment>()
                .HasOne(t => t.Diagnosis)
                .WithMany()
                .HasForeignKey(t => t.DiagnosisId)
                .OnDelete(DeleteBehavior.Restrict);

            base.OnModelCreating(modelBuilder);

            // Configure Message indexes for better query performance
            modelBuilder.Entity<Message>()
                .HasIndex(m => m.SenderUsername);

            modelBuilder.Entity<Message>()
                .HasIndex(m => m.ReceiverUsername);

            modelBuilder.Entity<Message>()
                .HasIndex(m => m.ConversationId);

            modelBuilder.Entity<Message>()
                .HasIndex(m => m.IsRead);

            modelBuilder.Entity<Message>()
                .HasIndex(m => m.SentAt);
        }
    }
}