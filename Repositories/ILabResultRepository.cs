using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface ILabResultRepository
    {
        // Get operations
        Task<LabResult?> GetByIdAsync(int id);
        Task<IEnumerable<LabResult>> GetAllAsync();
        Task<IEnumerable<LabResult>> GetByClientIdAsync(int clientId);
        Task<IEnumerable<LabResult>> GetByStatusAsync(string status);
        Task<IEnumerable<LabResult>> GetByTestTypeAsync(string testType);
        Task<IEnumerable<LabResult>> GetAbnormalResultsAsync();
        Task<IEnumerable<LabResult>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);

        // Command operations
        Task AddAsync(LabResult labResult);
        Task UpdateAsync(LabResult labResult);
        Task DeleteAsync(int id);
        
        // Check if exists
        Task<bool> ExistsAsync(int id);
        
        // Get count
        Task<int> GetCountByClientIdAsync(int clientId);
        Task<int> GetAbnormalCountByClientIdAsync(int clientId);
    }
}