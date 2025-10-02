using FinalYearProject.Data;
using FinalYearProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Repositories
{
    public interface IAdminRepository
    {
        Task<Admin?> GetByUserNameAsync(string username);
        Task AddAsync(Admin admin);
        Task SaveChangesAsync();
    }

    public class AdminRepository : IAdminRepository
    {
        private readonly AppDbContext _db;
        public AdminRepository(AppDbContext db) => _db = db;

        public Task<Admin?> GetByUserNameAsync(string username) =>
            _db.Admins.FirstOrDefaultAsync(a => a.UserName == username);

        public Task AddAsync(Admin admin)
        {
            _db.Admins.Add(admin);
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync() => _db.SaveChangesAsync();
    }
}
