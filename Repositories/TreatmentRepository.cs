using Microsoft.EntityFrameworkCore;
using FinalYearProject.Data;
using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public class TreatmentRepository : ITreatmentRepository
    {
        private readonly AppDbContext _context;

        public TreatmentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Treatment>> GetAllAsync()
        {
            return await _context.Treatments
                .Include(t => t.Client)
                .Include(t => t.ProvidedByDoctor)
                .Include(t => t.Prescription)
                    .ThenInclude(p => p.PrescribedByDoctor)
                .Include(t => t.NextAppointment)
                    .ThenInclude(a => a.Doctor)
                .Include(t => t.Diagnosis)
                    .ThenInclude(d => d.DiagnosedByDoctor)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Treatment>> GetByClientIdAsync(int clientId)
        {
            return await _context.Treatments
                .Include(t => t.Client)
                .Include(t => t.ProvidedByDoctor)
                .Include(t => t.Prescription)
                    .ThenInclude(p => p.PrescribedByDoctor)
                .Include(t => t.NextAppointment)
                    .ThenInclude(a => a.Doctor)
                .Include(t => t.Diagnosis)
                    .ThenInclude(d => d.DiagnosedByDoctor)
                .Where(t => t.ClientId == clientId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Treatment>> GetByDoctorIdAsync(int doctorId)
        {
            return await _context.Treatments
                .Include(t => t.Client)
                .Include(t => t.ProvidedByDoctor)
                .Include(t => t.Prescription)
                    .ThenInclude(p => p.PrescribedByDoctor)
                .Include(t => t.NextAppointment)
                    .ThenInclude(a => a.Doctor)
                .Include(t => t.Diagnosis)
                    .ThenInclude(d => d.DiagnosedByDoctor)
                .Where(t => t.ProvidedByDoctorId == doctorId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Treatment>> GetByClientIdsAsync(List<int> clientIds)
        {
            return await _context.Treatments
                .Include(t => t.Client)
                .Include(t => t.ProvidedByDoctor)
                .Include(t => t.Prescription)
                    .ThenInclude(p => p.PrescribedByDoctor)
                .Include(t => t.NextAppointment)
                    .ThenInclude(a => a.Doctor)
                .Include(t => t.Diagnosis)
                    .ThenInclude(d => d.DiagnosedByDoctor)
                .Where(t => clientIds.Contains(t.ClientId))
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Treatment>> GetByStatusAsync(string status)
        {
            return await _context.Treatments
                .Include(t => t.Client)
                .Include(t => t.ProvidedByDoctor)
                .Include(t => t.Prescription)
                    .ThenInclude(p => p.PrescribedByDoctor)
                .Include(t => t.NextAppointment)
                    .ThenInclude(a => a.Doctor)
                .Include(t => t.Diagnosis)
                    .ThenInclude(d => d.DiagnosedByDoctor)
                .Where(t => t.Status == status)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Treatment>> GetActiveTreatmentsByClientIdAsync(int clientId)
        {
            return await _context.Treatments
                .Include(t => t.Client)
                .Include(t => t.ProvidedByDoctor)
                .Include(t => t.Prescription)
                    .ThenInclude(p => p.PrescribedByDoctor)
                .Include(t => t.NextAppointment)
                    .ThenInclude(a => a.Doctor)
                .Include(t => t.Diagnosis)
                    .ThenInclude(d => d.DiagnosedByDoctor)
                .Where(t => t.ClientId == clientId && t.Status == "Active")
                .OrderByDescending(t => t.StartDate)
                .ToListAsync();
        }

        public async Task<Treatment?> GetByIdAsync(int id)
        {
            return await _context.Treatments
                .Include(t => t.Client)
                .Include(t => t.ProvidedByDoctor)
                .Include(t => t.Prescription)
                    .ThenInclude(p => p.PrescribedByDoctor)
                .Include(t => t.NextAppointment)
                    .ThenInclude(a => a.Doctor)
                .Include(t => t.Diagnosis)
                    .ThenInclude(d => d.DiagnosedByDoctor)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<Treatment> CreateAsync(Treatment treatment)
        {
            treatment.CreatedAt = DateTime.UtcNow;
            _context.Treatments.Add(treatment);
            await _context.SaveChangesAsync();
            
            // Reload with navigation properties
            return (await GetByIdAsync(treatment.Id))!;
        }

        public async Task<Treatment> UpdateAsync(Treatment treatment)
        {
            treatment.UpdatedAt = DateTime.UtcNow;
            _context.Treatments.Update(treatment);
            await _context.SaveChangesAsync();
            
            // Reload with navigation properties
            return (await GetByIdAsync(treatment.Id))!;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var treatment = await _context.Treatments.FindAsync(id);
            if (treatment == null)
            {
                return false;
            }

            _context.Treatments.Remove(treatment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Treatments.AnyAsync(t => t.Id == id);
        }
    }
}