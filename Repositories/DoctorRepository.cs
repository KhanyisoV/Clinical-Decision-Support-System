using FinalYearProject.Models;
using FinalYearProject.Data;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Repositories
{
    public class DoctorRepository : IDoctorRepository
    {
        private readonly AppDbContext _context;

        public DoctorRepository(AppDbContext context)
        {
            _context = context;
        }

        public Doctor? GetByUserName(string username)
        {
            return _context.Doctors
                .FirstOrDefault(d => d.UserName == username);
        }

        public Doctor? GetById(int id)
        {
            return _context.Doctors
                .FirstOrDefault(d => d.Id == id);
        }

        public IEnumerable<Doctor> GetAll()
        {
            return _context.Doctors.ToList();
        }

        public void Add(Doctor doctor)
        {
            // CreatedAt is set automatically by the model's default value
            _context.Doctors.Add(doctor);
        }

        public void Update(Doctor doctor)
        {
            doctor.UpdatedAt = DateTime.UtcNow;
            _context.Doctors.Update(doctor);
        }

        public void Delete(Doctor doctor)
        {
            _context.Doctors.Remove(doctor);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}