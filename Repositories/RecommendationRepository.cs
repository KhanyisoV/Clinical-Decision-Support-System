using FinalYearProject.Data;
using FinalYearProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Repositories
{
    public class RecommendationRepository : IRecommendationRepository
    {
        private readonly AppDbContext _context;

        public RecommendationRepository(AppDbContext context)
        {
            _context = context;
        }

        public void Add(Recommendation recommendation)
        {
            _context.Recommendations.Add(recommendation);
        }

        public void Update(Recommendation recommendation)
        {
            recommendation.UpdatedAt = DateTime.UtcNow;
            _context.Entry(recommendation).State = EntityState.Modified;
        }

        public void Delete(Recommendation recommendation)
        {
            _context.Recommendations.Remove(recommendation);
        }

        public Recommendation? GetById(int id)
        {
            return _context.Recommendations
                .Include(r => r.Client)
                .Include(r => r.Doctor)
                .FirstOrDefault(r => r.Id == id);
        }

        public IEnumerable<Recommendation> GetByClientId(int clientId)
        {
            return _context.Recommendations
                .Include(r => r.Doctor)
                .Where(r => r.ClientId == clientId)
                .OrderByDescending(r => r.DateGiven)
                .ToList();
        }

        public IEnumerable<Recommendation> GetByDoctorId(int doctorId)
        {
            return _context.Recommendations
                .Include(r => r.Client)
                .Where(r => r.DoctorId == doctorId)
                .OrderByDescending(r => r.DateGiven)
                .ToList();
        }

        public IEnumerable<Recommendation> GetAll()
        {
            return _context.Recommendations
                .Include(r => r.Client)
                .Include(r => r.Doctor)
                .ToList();
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}
