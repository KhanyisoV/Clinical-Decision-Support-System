using FinalYearProject.Models;
using FinalYearProject.Data;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Repositories
{
    public class ClientRepository : IClientRepository
    {
        private readonly AppDbContext _context;

        public ClientRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Client?> GetByUsernameAsync(string username)
        {
            return await _context.Clients.FirstOrDefaultAsync(c => c.UserName == username);
        }

        public Client? GetByUserName(string username)
        {
            return _context.Clients
                .Include(c => c.AssignedDoctor)
                .FirstOrDefault(c => c.UserName == username);
        }

        public Client? GetById(int id)
        {
            return _context.Clients
                .Include(c => c.AssignedDoctor)
                .FirstOrDefault(c => c.Id == id);
        }

        public IEnumerable<Client> GetAll()
        {
            return _context.Clients
                .Include(c => c.AssignedDoctor)
                .ToList();
        }

        public IEnumerable<Client> GetClientsByDoctorId(int doctorId)
        {
            return _context.Clients
                .Include(c => c.AssignedDoctor)
                .Where(c => c.AssignedDoctorId == doctorId)
                .ToList();
        }

        public void Add(Client client)
        {
            // CreatedAt is set automatically by the model's default value
            _context.Clients.Add(client);
        }

        public void Update(Client client)
        {
            client.UpdatedAt = DateTime.UtcNow;
            _context.Clients.Update(client);
        }

        public void Delete(Client client)
        {
            _context.Clients.Remove(client);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}