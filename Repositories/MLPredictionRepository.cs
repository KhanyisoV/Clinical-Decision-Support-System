using FinalYearProject.Data;
using FinalYearProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Repositories
{
    public class MLPredictionRepository : IMLPredictionRepository
    {
        private readonly AppDbContext _db;

        public MLPredictionRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<MLPrediction?> GetByIdAsync(int id)
        {
            return await _db.MLPredictions
                .Include(p => p.Client)
                .Include(p => p.ReviewedByDoctor)
                .Include(p => p.Diagnosis)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<MLPrediction>> GetAllAsync()
        {
            return await _db.MLPredictions
                .Include(p => p.Client)
                .Include(p => p.ReviewedByDoctor)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<MLPrediction>> GetByClientIdAsync(int clientId)
        {
            return await _db.MLPredictions
                .Include(p => p.Client)
                .Include(p => p.ReviewedByDoctor)
                .Where(p => p.ClientId == clientId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<MLPrediction>> GetUnreviewedAsync()
        {
            return await _db.MLPredictions
                .Include(p => p.Client)
                .Where(p => !p.IsReviewedByDoctor)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<MLPrediction>> GetByDoctorIdAsync(int doctorId)
        {
            return await _db.MLPredictions
                .Include(p => p.Client)
                .Include(p => p.ReviewedByDoctor)
                .Where(p => p.ReviewedByDoctorId == doctorId)
                .OrderByDescending(p => p.ReviewedAt)
                .ToListAsync();
        }

        public async Task AddAsync(MLPrediction prediction)
        {
            await _db.MLPredictions.AddAsync(prediction);
        }

        public async Task UpdateAsync(MLPrediction prediction)
        {
            _db.MLPredictions.Update(prediction);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(int id)
        {
            var prediction = await _db.MLPredictions.FindAsync(id);
            if (prediction != null)
            {
                _db.MLPredictions.Remove(prediction);
            }
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _db.SaveChangesAsync() > 0;
        }
    }
}