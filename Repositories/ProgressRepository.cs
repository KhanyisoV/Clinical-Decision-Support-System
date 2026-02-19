using Microsoft.EntityFrameworkCore;
using FinalYearProject.Data;
using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public class ProgressRepository : IProgressRepository
    {
        private readonly AppDbContext _context;

        public ProgressRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Progress>> GetAllAsync()
        {
            return await _context.Progresses
                .Include(p => p.Client)
                .Include(p => p.RecordedByDoctor)
                .Include(p => p.Diagnosis)
                    .ThenInclude(d => d!.DiagnosedByDoctor)
                .Include(p => p.Treatment)
                    .ThenInclude(t => t!.ProvidedByDoctor)
                .OrderByDescending(p => p.DateRecorded)
                .ToListAsync();
        }

        public async Task<IEnumerable<Progress>> GetByClientIdAsync(int clientId)
        {
            return await _context.Progresses
                .Include(p => p.Client)
                .Include(p => p.RecordedByDoctor)
                .Include(p => p.Diagnosis)
                    .ThenInclude(d => d!.DiagnosedByDoctor)
                .Include(p => p.Treatment)
                    .ThenInclude(t => t!.ProvidedByDoctor)
                .Where(p => p.ClientId == clientId)
                .OrderByDescending(p => p.DateRecorded)
                .ToListAsync();
        }

        public async Task<IEnumerable<Progress>> GetByDoctorIdAsync(int doctorId)
        {
            return await _context.Progresses
                .Include(p => p.Client)
                .Include(p => p.RecordedByDoctor)
                .Include(p => p.Diagnosis)
                    .ThenInclude(d => d!.DiagnosedByDoctor)
                .Include(p => p.Treatment)
                    .ThenInclude(t => t!.ProvidedByDoctor)
                .Where(p => p.RecordedByDoctorId == doctorId)
                .OrderByDescending(p => p.DateRecorded)
                .ToListAsync();
        }

        public async Task<IEnumerable<Progress>> GetByClientIdsAsync(List<int> clientIds)
        {
            return await _context.Progresses
                .Include(p => p.Client)
                .Include(p => p.RecordedByDoctor)
                .Include(p => p.Diagnosis)
                    .ThenInclude(d => d!.DiagnosedByDoctor)
                .Include(p => p.Treatment)
                    .ThenInclude(t => t!.ProvidedByDoctor)
                .Where(p => clientIds.Contains(p.ClientId))
                .OrderByDescending(p => p.DateRecorded)
                .ToListAsync();
        }

        public async Task<IEnumerable<Progress>> GetByDiagnosisIdAsync(int diagnosisId)
        {
            return await _context.Progresses
                .Include(p => p.Client)
                .Include(p => p.RecordedByDoctor)
                .Include(p => p.Diagnosis)
                    .ThenInclude(d => d!.DiagnosedByDoctor)
                .Include(p => p.Treatment)
                    .ThenInclude(t => t!.ProvidedByDoctor)
                .Where(p => p.DiagnosisId == diagnosisId)
                .OrderByDescending(p => p.DateRecorded)
                .ToListAsync();
        }

        public async Task<IEnumerable<Progress>> GetByTreatmentIdAsync(int treatmentId)
        {
            return await _context.Progresses
                .Include(p => p.Client)
                .Include(p => p.RecordedByDoctor)
                .Include(p => p.Diagnosis)
                    .ThenInclude(d => d!.DiagnosedByDoctor)
                .Include(p => p.Treatment)
                    .ThenInclude(t => t!.ProvidedByDoctor)
                .Where(p => p.TreatmentId == treatmentId)
                .OrderByDescending(p => p.DateRecorded)
                .ToListAsync();
        }

        public async Task<IEnumerable<Progress>> GetByStatusAsync(string status)
        {
            return await _context.Progresses
                .Include(p => p.Client)
                .Include(p => p.RecordedByDoctor)
                .Include(p => p.Diagnosis)
                    .ThenInclude(d => d!.DiagnosedByDoctor)
                .Include(p => p.Treatment)
                    .ThenInclude(t => t!.ProvidedByDoctor)
                .Where(p => p.ProgressStatus == status)
                .OrderByDescending(p => p.DateRecorded)
                .ToListAsync();
        }

        public async Task<IEnumerable<Progress>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Progresses
                .Include(p => p.Client)
                .Include(p => p.RecordedByDoctor)
                .Include(p => p.Diagnosis)
                    .ThenInclude(d => d!.DiagnosedByDoctor)
                .Include(p => p.Treatment)
                    .ThenInclude(t => t!.ProvidedByDoctor)
                .Where(p => p.DateRecorded >= startDate && p.DateRecorded <= endDate)
                .OrderByDescending(p => p.DateRecorded)
                .ToListAsync();
        }

        public async Task<Progress?> GetByIdAsync(int id)
        {
            return await _context.Progresses
                .Include(p => p.Client)
                .Include(p => p.RecordedByDoctor)
                .Include(p => p.Diagnosis)
                    .ThenInclude(d => d!.DiagnosedByDoctor)
                .Include(p => p.Treatment)
                    .ThenInclude(t => t!.ProvidedByDoctor)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Progress> CreateAsync(Progress progress)
        {
            progress.CreatedAt = DateTime.UtcNow;
            _context.Progresses.Add(progress);
            await _context.SaveChangesAsync();
            
            // Reload with navigation properties
            return (await GetByIdAsync(progress.Id))!;
        }

        public async Task<Progress> UpdateAsync(Progress progress)
        {
            progress.UpdatedAt = DateTime.UtcNow;
            _context.Progresses.Update(progress);
            await _context.SaveChangesAsync();
            
            // Reload with navigation properties
            return (await GetByIdAsync(progress.Id))!;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var progress = await _context.Progresses.FindAsync(id);
            if (progress == null)
            {
                return false;
            }

            _context.Progresses.Remove(progress);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Progresses.AnyAsync(p => p.Id == id);
        }
    }
}