
using FinalYearProject.Data;
using FinalYearProject.Models;
using System.Linq;
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
        public Doctor GetById(int id)
        {

        // Example implementation using EF Core

        return _context.Doctors.FirstOrDefault(d => d.Id == id);
        }

        public Doctor? GetByUserName(string username) =>
            _context.Doctors.FirstOrDefault(d => d.UserName == username);

        public void Add(Doctor doctor)
        {
            _context.Doctors.Add(doctor);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}