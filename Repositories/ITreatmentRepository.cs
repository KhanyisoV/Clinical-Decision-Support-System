using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface ITreatmentRepository
    {
        Task<IEnumerable<Treatment>> GetAllAsync();
        Task<IEnumerable<Treatment>> GetByClientIdAsync(int clientId);
        Task<IEnumerable<Treatment>> GetByDoctorIdAsync(int doctorId);
        Task<IEnumerable<Treatment>> GetByClientIdsAsync(List<int> clientIds);
        Task<IEnumerable<Treatment>> GetByStatusAsync(string status);
        Task<IEnumerable<Treatment>> GetActiveTreatmentsByClientIdAsync(int clientId);
        Task<Treatment?> GetByIdAsync(int id);
        Task<Treatment> CreateAsync(Treatment treatment);
        Task<Treatment> UpdateAsync(Treatment treatment);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}