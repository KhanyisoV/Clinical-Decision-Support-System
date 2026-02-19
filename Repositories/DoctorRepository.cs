using FinalYearProject.Data;
using FinalYearProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Repositories
{
    public interface IDoctorRepository
    {
        IEnumerable<Doctor> GetAll();
        Doctor? GetById(int id);
        Doctor? GetByUserName(string username);
        Task<Doctor?> GetByUsernameAsync(string username);
        void Add(Doctor doctor);
        void Update(Doctor doctor);
        void Delete(Doctor doctor);
        void Save();
    }

    public class DoctorRepository : IDoctorRepository
    {
        private readonly AppDbContext _db;

        public DoctorRepository(AppDbContext db)
        {
            _db = db;
        }
        public async Task<Doctor?> GetByUsernameAsync(string username)
        {
            return await _db.Doctors.FirstOrDefaultAsync(d => d.UserName == username);
        }

        public IEnumerable<Doctor> GetAll()
        {
            return _db.Doctors.ToList();
        }

        public Doctor? GetById(int id)
        {
            return _db.Doctors.Find(id);
        }

        public Doctor? GetByUserName(string username)
        {
            return _db.Doctors.FirstOrDefault(d => d.UserName == username);
        }

        public void Add(Doctor doctor)
        {
            _db.Doctors.Add(doctor);
        }

        public void Update(Doctor doctor)
        {
            _db.Doctors.Update(doctor);
        }

        public void Delete(Doctor doctor)
        {
            _db.Doctors.Remove(doctor);
        }

        public void Save()
        {
            _db.SaveChanges();
        }
    }
}