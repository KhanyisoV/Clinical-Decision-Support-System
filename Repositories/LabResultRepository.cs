using FinalYearProject.Data;
using FinalYearProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Repositories
{
    public class LabResultRepository : ILabResultRepository
    {
        private readonly AppDbContext _context;

        public LabResultRepository(AppDbContext context)
        {
            _context = context;
        }

        // Get by ID with Client included
        public async Task<LabResult?> GetByIdAsync(int id)
        {
            return await _context.LabResults
                .Include(lr => lr.Client)
                .FirstOrDefaultAsync(lr => lr.Id == id);
        }

        // Get all lab results with Client included
        public async Task<IEnumerable<LabResult>> GetAllAsync()
        {
            return await _context.LabResults
                .Include(lr => lr.Client)
                .OrderByDescending(lr => lr.TestDate)
                .ToListAsync();
        }

        // Get lab results by client ID
        public async Task<IEnumerable<LabResult>> GetByClientIdAsync(int clientId)
        {
            return await _context.LabResults
                .Include(lr => lr.Client)
                .Where(lr => lr.ClientId == clientId)
                .OrderByDescending(lr => lr.TestDate)
                .ToListAsync();
        }

        // Get lab results by status
        public async Task<IEnumerable<LabResult>> GetByStatusAsync(string status)
        {
            return await _context.LabResults
                .Include(lr => lr.Client)
                .Where(lr => lr.Status == status)
                .OrderByDescending(lr => lr.TestDate)
                .ToListAsync();
        }

        // Get lab results by test type
        public async Task<IEnumerable<LabResult>> GetByTestTypeAsync(string testType)
        {
            return await _context.LabResults
                .Include(lr => lr.Client)
                .Where(lr => lr.TestType == testType)
                .OrderByDescending(lr => lr.TestDate)
                .ToListAsync();
        }

        // Get all abnormal results
        public async Task<IEnumerable<LabResult>> GetAbnormalResultsAsync()
        {
            return await _context.LabResults
                .Include(lr => lr.Client)
                .Where(lr => lr.IsAbnormal)
                .OrderByDescending(lr => lr.TestDate)
                .ToListAsync();
        }

        // Get lab results by date range
        public async Task<IEnumerable<LabResult>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.LabResults
                .Include(lr => lr.Client)
                .Where(lr => lr.TestDate >= startDate && lr.TestDate <= endDate)
                .OrderByDescending(lr => lr.TestDate)
                .ToListAsync();
        }

        // Add new lab result
        public async Task AddAsync(LabResult labResult)
        {
            await _context.LabResults.AddAsync(labResult);
            await _context.SaveChangesAsync();
        }

        // Update existing lab result
        public async Task UpdateAsync(LabResult labResult)
        {
            labResult.UpdatedAt = DateTime.UtcNow;
            _context.LabResults.Update(labResult);
            await _context.SaveChangesAsync();
        }

        // Delete lab result
        public async Task DeleteAsync(int id)
        {
            var labResult = await _context.LabResults.FindAsync(id);
            if (labResult != null)
            {
                _context.LabResults.Remove(labResult);
                await _context.SaveChangesAsync();
            }
        }

        // Check if lab result exists
        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.LabResults.AnyAsync(lr => lr.Id == id);
        }

        // Get count of lab results for a client
        public async Task<int> GetCountByClientIdAsync(int clientId)
        {
            return await _context.LabResults
                .CountAsync(lr => lr.ClientId == clientId);
        }

        // Get count of abnormal results for a client
        public async Task<int> GetAbnormalCountByClientIdAsync(int clientId)
        {
            return await _context.LabResults
                .CountAsync(lr => lr.ClientId == clientId && lr.IsAbnormal);
        }
    }
}