using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface IAllergyRepository
    {
        // Get operations
        Task<Allergy?> GetByIdAsync(int id);
        Task<IEnumerable<Allergy>> GetAllAsync();
        Task<IEnumerable<Allergy>> GetByClientIdAsync(int clientId);
        Task<IEnumerable<Allergy>> GetActiveByClientIdAsync(int clientId);
        Task<IEnumerable<Allergy>> GetByAllergyTypeAsync(string allergyType);
        Task<IEnumerable<Allergy>> GetBySeverityAsync(string severity);
        Task<IEnumerable<Allergy>> GetLifeThreateningAllergiesAsync();
        
        // Command operations
        Task AddAsync(Allergy allergy);
        Task UpdateAsync(Allergy allergy);
        Task DeleteAsync(int id);
        
        // Check if exists
        Task<bool> ExistsAsync(int id);
        
        // Get count
        Task<int> GetCountByClientIdAsync(int clientId);
        Task<int> GetActiveCountByClientIdAsync(int clientId);
        Task<int> GetSevereCountByClientIdAsync(int clientId);
    }
}