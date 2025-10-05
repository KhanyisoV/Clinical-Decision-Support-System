using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface IMLPredictionRepository
    {
        Task<MLPrediction?> GetByIdAsync(int id);
        Task<List<MLPrediction>> GetAllAsync();
        Task<List<MLPrediction>> GetByClientIdAsync(int clientId);
        Task<List<MLPrediction>> GetUnreviewedAsync();
        Task<List<MLPrediction>> GetByDoctorIdAsync(int doctorId);
        Task AddAsync(MLPrediction prediction);
        Task UpdateAsync(MLPrediction prediction);
        Task DeleteAsync(int id);
        Task<bool> SaveChangesAsync();
    }
}