using FinalYearProject.Data;
using FinalYearProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Repositories
{
    public class DiagnosisRepository : IDiagnosisRepository
    {
        private readonly AppDbContext _context;

        public DiagnosisRepository(AppDbContext context)
        {
            _context = context;
        }

        public void Add(Diagnosis diagnosis)
        {
            _context.Diagnoses.Add(diagnosis);
        }

        public void Update(Diagnosis diagnosis)
        {
            diagnosis.UpdatedAt = DateTime.UtcNow;
            _context.Entry(diagnosis).State = EntityState.Modified;
        }

        public void Delete(Diagnosis diagnosis)
        {
            _context.Diagnoses.Remove(diagnosis);
        }

        public Diagnosis? GetById(int id)
        {
            return _context.Diagnoses
                .Include(d => d.Client)
                .Include(d => d.DiagnosedByDoctor)
                .FirstOrDefault(d => d.Id == id);
        }

        public IEnumerable<Diagnosis> GetByClientId(int clientId)
        {
            return _context.Diagnoses
                .Include(d => d.DiagnosedByDoctor)
                .Where(d => d.ClientId == clientId)
                .OrderByDescending(d => d.DateDiagnosed)
                .ToList();
        }

        public IEnumerable<Diagnosis> GetByDoctorId(int doctorId)
        {
            return _context.Diagnoses
                .Include(d => d.Client)
                .Where(d => d.DiagnosedByDoctorId == doctorId)
                .OrderByDescending(d => d.DateDiagnosed)
                .ToList();
        }

        public IEnumerable<Diagnosis> GetActiveDiagnosesByClientId(int clientId)
        {
            return _context.Diagnoses
                .Include(d => d.DiagnosedByDoctor)
                .Where(d => d.ClientId == clientId && d.IsActive)
                .OrderByDescending(d => d.DateDiagnosed)
                .ToList();
        }

        public IEnumerable<Diagnosis> GetAll()
        {
            return _context.Diagnoses
                .Include(d => d.Client)
                .Include(d => d.DiagnosedByDoctor)
                .OrderByDescending(d => d.DateDiagnosed)
                .ToList();
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}