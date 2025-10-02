using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface IClientRepository
    {
        Client? GetByUserName(string username);
        Client? GetById(int id);
        IEnumerable<Client> GetAll();
        IEnumerable<Client> GetClientsByDoctorId(int doctorId);
        void Add(Client client);
        void Update(Client client);
        void Delete(Client client);
        void Save();
    }
}