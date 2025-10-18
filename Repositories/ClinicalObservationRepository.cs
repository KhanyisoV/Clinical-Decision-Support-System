using FinalYearProject.Models;
using FinalYearProject.Data;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Repositories
{
    public class ClinicalObservationRepository : IClinicalObservationRepository
    {
        private readonly AppDbContext _context;

        public ClinicalObservationRepository(AppDbContext context)
        {
            _context = context;
        }

        public void Add(ClinicalObservation observation)
        {
            _context.ClinicalObservations.Add(observation);
        }

        public void Update(ClinicalObservation observation)
        {
            observation.UpdatedAt = DateTime.UtcNow;
            _context.ClinicalObservations.Update(observation);
        }

        public void Delete(ClinicalObservation observation)
        {
            _context.ClinicalObservations.Remove(observation);
        }

        public ClinicalObservation? GetById(int id)
        {
            return _context.ClinicalObservations
                .Include(o => o.Client)
                .Include(o => o.RecordedByDoctor)
                .FirstOrDefault(o => o.Id == id);
        }

        public IEnumerable<ClinicalObservation> GetByClientId(int clientId)
        {
            return _context.ClinicalObservations
                .Include(o => o.Client)
                .Include(o => o.RecordedByDoctor)
                .Where(o => o.ClientId == clientId)
                .OrderByDescending(o => o.ObservationDate)
                .ToList();
        }

        public IEnumerable<ClinicalObservation> GetByDoctorId(int doctorId)
        {
            return _context.ClinicalObservations
                .Include(o => o.Client)
                .Include(o => o.RecordedByDoctor) 
                .Where(o => o.RecordedByDoctorId == doctorId)
                .OrderByDescending(o => o.ObservationDate)
                .ToList();
        }

        public IEnumerable<ClinicalObservation> GetAll()
        {
            return _context.ClinicalObservations
                .Include(o => o.Client)
                .Include(o => o.RecordedByDoctor)
                .ToList();
        }

        public ClinicalObservation? GetLatestByClientId(int clientId)
        {
            return _context.ClinicalObservations
                .Include(o => o.Client)              // ADD THIS LINE
                .Include(o => o.RecordedByDoctor)
                .Where(o => o.ClientId == clientId)
                .OrderByDescending(o => o.ObservationDate) // Make sure ObservationDate exists in your model
                .FirstOrDefault();
        }


        public void Save()
        {
            _context.SaveChanges();
        }
    }
}
