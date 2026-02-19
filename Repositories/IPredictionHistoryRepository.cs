using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface IPredictionHistoryRepository
    {
        Task<PredictionHistory?> GetByIdAsync(int id);
        Task<List<PredictionHistory>> GetAllAsync();
        Task<List<PredictionHistory>> GetByClientIdAsync(int clientId);
        Task<List<PredictionHistory>> GetByMLPredictionIdAsync(int mlPredictionId);
        Task<List<PredictionHistory>> GetByStatusAsync(string status);
        Task<List<PredictionHistory>> GetByDoctorIdAsync(int doctorId);
        Task AddAsync(PredictionHistory history);
        Task UpdateAsync(PredictionHistory history);
        Task DeleteAsync(int id);
        Task<bool> SaveChangesAsync();
    }
}