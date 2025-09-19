using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface IDoctorRepository
    {
        Doctor? GetByUserName(string username);
        Doctor GetById(int id);
        void Add(Doctor doctor);
        void Save();
    }
}