using FinalYearProject.Data;
using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public class ClientRepository : IClientRepository
    {
        private readonly AppDbContext _context;

        public ClientRepository(AppDbContext context)
        {
            _context = context;
        }

        public Client GetByUserName(string userName)
        {
            return _context.Clients.FirstOrDefault(c => c.UserName == userName);
        }

        public Client GetById(int id)
        {
            return _context.Clients.Find(id);
        }

        public void Add(Client client)
        {
            _context.Clients.Add(client);
        }

        public void Update(Client client)
        {
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
