using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface IClientRepository
    {
        Client? GetByUserName(string username);
        Client? GetById(int id);
        IEnumerable<Client> GetAll();
        IEnumerable<Client> GetClientsByDoctorId(int doctorId);
        Task<Client?> GetByUsernameAsync(string username);
        void Add(Client client);
        void Update(Client client);
        void Delete(Client client);
        void Save();
    }
}