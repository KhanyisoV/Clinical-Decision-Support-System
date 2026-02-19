using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface IProgressRepository
    {
        Task<IEnumerable<Progress>> GetAllAsync();
        Task<IEnumerable<Progress>> GetByClientIdAsync(int clientId);
        Task<IEnumerable<Progress>> GetByDoctorIdAsync(int doctorId);
        Task<IEnumerable<Progress>> GetByClientIdsAsync(List<int> clientIds);
        Task<IEnumerable<Progress>> GetByDiagnosisIdAsync(int diagnosisId);
        Task<IEnumerable<Progress>> GetByTreatmentIdAsync(int treatmentId);
        Task<IEnumerable<Progress>> GetByStatusAsync(string status);
        Task<IEnumerable<Progress>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<Progress?> GetByIdAsync(int id);
        Task<Progress> CreateAsync(Progress progress);
        Task<Progress> UpdateAsync(Progress progress);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}