using Microsoft.EntityFrameworkCore;
using FinalYearProject.Data;
using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public class PrescriptionRepository : IPrescriptionRepository
    {
        private readonly AppDbContext _context;

        public PrescriptionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Prescription>> GetAllAsync()
        {
            return await _context.Prescriptions
                .Include(p => p.Client)
                .Include(p => p.PrescribedByDoctor)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Prescription>> GetByClientIdAsync(int clientId)
        {
            return await _context.Prescriptions
                .Include(p => p.Client)
                .Include(p => p.PrescribedByDoctor)
                .Where(p => p.ClientId == clientId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Prescription>> GetByDoctorIdAsync(int doctorId)
        {
            return await _context.Prescriptions
                .Include(p => p.Client)
                .Include(p => p.PrescribedByDoctor)
                .Where(p => p.PrescribedByDoctorId == doctorId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Prescription>> GetByClientIdsAsync(List<int> clientIds)
        {
            return await _context.Prescriptions
                .Include(p => p.Client)
                .Include(p => p.PrescribedByDoctor)
                .Where(p => clientIds.Contains(p.ClientId))
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<Prescription?> GetByIdAsync(int id)
        {
            return await _context.Prescriptions
                .Include(p => p.Client)
                .Include(p => p.PrescribedByDoctor)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Prescription> CreateAsync(Prescription prescription)
        {
            prescription.CreatedAt = DateTime.UtcNow;
            _context.Prescriptions.Add(prescription);
            await _context.SaveChangesAsync();
            
            // Reload with navigation properties
            return (await GetByIdAsync(prescription.Id))!;
        }

        public async Task<Prescription> UpdateAsync(Prescription prescription)
        {
            prescription.UpdatedAt = DateTime.UtcNow;
            _context.Prescriptions.Update(prescription);
            await _context.SaveChangesAsync();
            
            // Reload with navigation properties
            return (await GetByIdAsync(prescription.Id))!;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var prescription = await _context.Prescriptions.FindAsync(id);
            if (prescription == null)
            {
                return false;
            }

            _context.Prescriptions.Remove(prescription);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Prescriptions.AnyAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Prescription>> GetActivePrescriptionsByClientIdAsync(int clientId)
        {
            return await _context.Prescriptions
                .Include(p => p.Client)
                .Include(p => p.PrescribedByDoctor)
                .Where(p => p.ClientId == clientId && p.IsActive && p.Status == "Active")
                .OrderByDescending(p => p.StartDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Prescription>> GetPrescriptionsByStatusAsync(string status)
        {
            return await _context.Prescriptions
                .Include(p => p.Client)
                .Include(p => p.PrescribedByDoctor)
                .Where(p => p.Status == status)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }
    }
}