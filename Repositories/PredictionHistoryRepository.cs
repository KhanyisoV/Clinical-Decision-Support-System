using FinalYearProject.Data;
using FinalYearProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Repositories
{
    public class PredictionHistoryRepository : IPredictionHistoryRepository
    {
        private readonly AppDbContext _db;

        public PredictionHistoryRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PredictionHistory?> GetByIdAsync(int id)
        {
            return await _db.PredictionHistories
                .Include(h => h.Client)
                .Include(h => h.MLPrediction)
                .Include(h => h.ActualDiagnosis)
                .Include(h => h.ReviewedByDoctor)
                .FirstOrDefaultAsync(h => h.Id == id);
        }

        public async Task<List<PredictionHistory>> GetAllAsync()
        {
            return await _db.PredictionHistories
                .Include(h => h.Client)
                .Include(h => h.MLPrediction)
                .Include(h => h.ReviewedByDoctor)
                .OrderByDescending(h => h.PredictedAt)
                .ToListAsync();
        }

        public async Task<List<PredictionHistory>> GetByClientIdAsync(int clientId)
        {
            return await _db.PredictionHistories
                .Include(h => h.Client)
                .Include(h => h.MLPrediction)
                .Include(h => h.ReviewedByDoctor)
                .Where(h => h.ClientId == clientId)
                .OrderByDescending(h => h.PredictedAt)
                .ToListAsync();
        }

        public async Task<List<PredictionHistory>> GetByMLPredictionIdAsync(int mlPredictionId)
        {
            return await _db.PredictionHistories
                .Include(h => h.Client)
                .Include(h => h.ReviewedByDoctor)
                .Where(h => h.MLPredictionId == mlPredictionId)
                .OrderByDescending(h => h.PredictedAt)
                .ToListAsync();
        }

        public async Task<List<PredictionHistory>> GetByStatusAsync(string status)
        {
            return await _db.PredictionHistories
                .Include(h => h.Client)
                .Include(h => h.MLPrediction)
                .Where(h => h.Status == status)
                .OrderByDescending(h => h.PredictedAt)
                .ToListAsync();
        }

        public async Task<List<PredictionHistory>> GetByDoctorIdAsync(int doctorId)
        {
            return await _db.PredictionHistories
                .Include(h => h.Client)
                .Include(h => h.MLPrediction)
                .Include(h => h.ReviewedByDoctor)
                .Where(h => h.ReviewedByDoctorId == doctorId)
                .OrderByDescending(h => h.ReviewedAt)
                .ToListAsync();
        }

        public async Task AddAsync(PredictionHistory history)
        {
            await _db.PredictionHistories.AddAsync(history);
        }

        public async Task UpdateAsync(PredictionHistory history)
        {
            _db.PredictionHistories.Update(history);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(int id)
        {
            var history = await _db.PredictionHistories.FindAsync(id);
            if (history != null)
            {
                _db.PredictionHistories.Remove(history);
            }
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _db.SaveChangesAsync() > 0;
        }
    }
}