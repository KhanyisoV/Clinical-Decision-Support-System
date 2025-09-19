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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
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

            base.OnModelCreating(modelBuilder);
        }
    }
}