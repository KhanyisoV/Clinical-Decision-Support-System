using FinalYearProject.Models;
using FinalYearProject.Data;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Repositories
{
    public class SymptomRepository : ISymptomRepository
    {
        private readonly AppDbContext _context;

        public SymptomRepository(AppDbContext context)
        {
            _context = context;
        }

        public Symptom? GetById(int id)
        {
            return _context.Symptoms
                .Include(s => s.Client)
                .Include(s => s.AddedByDoctor)
                .FirstOrDefault(s => s.Id == id);
        }

        public IEnumerable<Symptom> GetAll()
        {
            return _context.Symptoms
                .Include(s => s.Client)
                .Include(s => s.AddedByDoctor)
                .ToList();
        }

        public IEnumerable<Symptom> GetByClientId(int clientId)
        {
            return _context.Symptoms
                .Include(s => s.Client)
                .Include(s => s.AddedByDoctor)
                .Where(s => s.ClientId == clientId)
                .ToList();
        }

        public IEnumerable<Symptom> GetActiveSymptomsByClientId(int clientId)
        {
            return _context.Symptoms
                .Include(s => s.Client)
                .Include(s => s.AddedByDoctor)
                .Where(s => s.ClientId == clientId && s.IsActive)
                .OrderByDescending(s => s.DateReported)
                .ToList();
        }

        public IEnumerable<Symptom> GetByDoctorId(int doctorId)
        {
            return _context.Symptoms
                .Include(s => s.Client)
                .Include(s => s.AddedByDoctor)
                .Where(s => s.AddedByDoctorId == doctorId)
                .ToList();
        }

        public void Add(Symptom symptom)
        {
            // CreatedAt and DateReported are set automatically by the model's default values
            _context.Symptoms.Add(symptom);
        }

        public void Update(Symptom symptom)
        {
            symptom.UpdatedAt = DateTime.UtcNow;
            _context.Symptoms.Update(symptom);
        }

        public void Delete(Symptom symptom)
        {
            _context.Symptoms.Remove(symptom);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}