using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface IPrescriptionRepository
    {
        Task<IEnumerable<Prescription>> GetAllAsync();
        Task<IEnumerable<Prescription>> GetByClientIdAsync(int clientId);
        Task<IEnumerable<Prescription>> GetByDoctorIdAsync(int doctorId);
        Task<IEnumerable<Prescription>> GetByClientIdsAsync(List<int> clientIds);
        Task<Prescription?> GetByIdAsync(int id);
        Task<Prescription> CreateAsync(Prescription prescription);
        Task<Prescription> UpdateAsync(Prescription prescription);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<IEnumerable<Prescription>> GetActivePrescriptionsByClientIdAsync(int clientId);
        Task<IEnumerable<Prescription>> GetPrescriptionsByStatusAsync(string status);
    }
}