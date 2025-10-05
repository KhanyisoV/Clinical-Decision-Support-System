using FinalYearProject.Data;
using FinalYearProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Repositories
{
    public class AllergyRepository : IAllergyRepository
    {
        private readonly AppDbContext _context;

        public AllergyRepository(AppDbContext context)
        {
            _context = context;
        }

        // Get by ID with Client included
        public async Task<Allergy?> GetByIdAsync(int id)
        {
            return await _context.Allergies
                .Include(a => a.Client)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        // Get all allergies with Client included
        public async Task<IEnumerable<Allergy>> GetAllAsync()
        {
            return await _context.Allergies
                .Include(a => a.Client)
                .OrderByDescending(a => a.DiagnosedDate)
                .ToListAsync();
        }

        // Get allergies by client ID
        public async Task<IEnumerable<Allergy>> GetByClientIdAsync(int clientId)
        {
            return await _context.Allergies
                .Include(a => a.Client)
                .Where(a => a.ClientId == clientId)
                .OrderByDescending(a => a.DiagnosedDate)
                .ToListAsync();
        }

        // Get only active allergies by client ID
        public async Task<IEnumerable<Allergy>> GetActiveByClientIdAsync(int clientId)
        {
            return await _context.Allergies
                .Include(a => a.Client)
                .Where(a => a.ClientId == clientId && a.IsActive)
                .OrderByDescending(a => a.DiagnosedDate)
                .ToListAsync();
        }

        // Get allergies by type
        public async Task<IEnumerable<Allergy>> GetByAllergyTypeAsync(string allergyType)
        {
            return await _context.Allergies
                .Include(a => a.Client)
                .Where(a => a.AllergyType == allergyType)
                .OrderByDescending(a => a.DiagnosedDate)
                .ToListAsync();
        }

        // Get allergies by severity
        public async Task<IEnumerable<Allergy>> GetBySeverityAsync(string severity)
        {
            return await _context.Allergies
                .Include(a => a.Client)
                .Where(a => a.Severity == severity)
                .OrderByDescending(a => a.DiagnosedDate)
                .ToListAsync();
        }

        // Get life-threatening allergies
        public async Task<IEnumerable<Allergy>> GetLifeThreateningAllergiesAsync()
        {
            return await _context.Allergies
                .Include(a => a.Client)
                .Where(a => a.Severity == "Life-threatening" && a.IsActive)
                .OrderByDescending(a => a.DiagnosedDate)
                .ToListAsync();
        }

        // Add new allergy
        public async Task AddAsync(Allergy allergy)
        {
            await _context.Allergies.AddAsync(allergy);
            await _context.SaveChangesAsync();
        }

        // Update existing allergy
        public async Task UpdateAsync(Allergy allergy)
        {
            allergy.UpdatedAt = DateTime.UtcNow;
            _context.Allergies.Update(allergy);
            await _context.SaveChangesAsync();
        }

        // Delete allergy
        public async Task DeleteAsync(int id)
        {
            var allergy = await _context.Allergies.FindAsync(id);
            if (allergy != null)
            {
                _context.Allergies.Remove(allergy);
                await _context.SaveChangesAsync();
            }
        }

        // Check if allergy exists
        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Allergies.AnyAsync(a => a.Id == id);
        }

        // Get count of allergies for a client
        public async Task<int> GetCountByClientIdAsync(int clientId)
        {
            return await _context.Allergies
                .CountAsync(a => a.ClientId == clientId);
        }

        // Get count of active allergies for a client
        public async Task<int> GetActiveCountByClientIdAsync(int clientId)
        {
            return await _context.Allergies
                .CountAsync(a => a.ClientId == clientId && a.IsActive);
        }

        // Get count of severe/life-threatening allergies for a client
        public async Task<int> GetSevereCountByClientIdAsync(int clientId)
        {
            return await _context.Allergies
                .CountAsync(a => a.ClientId == clientId && 
                    (a.Severity == "Severe" || a.Severity == "Life-threatening") && 
                    a.IsActive);
        }
    }
}