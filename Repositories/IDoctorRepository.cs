using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface IDoctorRepository
    {
        Doctor? GetByUserName(string username);
        Doctor? GetById(int id);
        IEnumerable<Doctor> GetAll();
        void Add(Doctor doctor);
        void Update(Doctor doctor);
        void Delete(Doctor doctor);
        void Save();
    }
}