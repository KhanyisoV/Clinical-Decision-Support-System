using FinalYearProject.Data;
using FinalYearProject.Models;
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

        public void Add(Symptom symptom)
        {
            _context.Symptoms.Add(symptom);
        }

        public void Update(Symptom symptom)
        {
            _context.Entry(symptom).State = EntityState.Modified;
        }

        public void Delete(Symptom symptom)
        {
            _context.Symptoms.Remove(symptom);
        }

        public Symptom? GetById(int id)
        {
            return _context.Symptoms
                .Include(s => s.Client)
                .Include(s => s.AddedByDoctor)
                .FirstOrDefault(s => s.Id == id);
        }

        public IEnumerable<Symptom> GetByClientId(int clientId)
        {
            return _context.Symptoms
                .Include(s => s.AddedByDoctor)
                .Where(s => s.ClientId == clientId)
                .OrderByDescending(s => s.DateReported)
                .ToList();
        }

        public IEnumerable<Symptom> GetByDoctorId(int doctorId)
        {
            return _context.Symptoms
                .Include(s => s.Client)
                .Where(s => s.AddedByDoctorId == doctorId)
                .OrderByDescending(s => s.DateReported)
                .ToList();
        }

        public IEnumerable<Symptom> GetActiveSymptomsByClientId(int clientId)
        {
            return _context.Symptoms
                .Include(s => s.AddedByDoctor)
                .Where(s => s.ClientId == clientId && s.IsActive)
                .OrderByDescending(s => s.DateReported)
                .ToList();
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}
