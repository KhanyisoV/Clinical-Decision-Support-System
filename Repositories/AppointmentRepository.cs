using FinalYearProject.Data;
using FinalYearProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Repositories
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly AppDbContext _db;

        public AppointmentRepository(AppDbContext db)
        {
            _db = db;
        }

        public IEnumerable<Appointment> GetAll()
        {
            return _db.Appointments
                .Include(a => a.Client)
                .Include(a => a.Doctor)
                .ToList();
        }

        public Appointment? GetById(int id)
        {
            return _db.Appointments
                .Include(a => a.Client)
                .Include(a => a.Doctor)
                .FirstOrDefault(a => a.Id == id);
        }

        public IEnumerable<Appointment> GetByClientId(int clientId)
        {
            return _db.Appointments
                .Include(a => a.Client)
                .Include(a => a.Doctor)
                .Where(a => a.ClientId == clientId)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.StartTime)
                .ToList();
        }

        public IEnumerable<Appointment> GetByDoctorId(int doctorId)
        {
            return _db.Appointments
                .Include(a => a.Client)
                .Include(a => a.Doctor)
                .Where(a => a.DoctorId == doctorId)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.StartTime)
                .ToList();
        }

        public IEnumerable<Appointment> GetByDateRange(DateTime startDate, DateTime endDate)
        {
            return _db.Appointments
                .Include(a => a.Client)
                .Include(a => a.Doctor)
                .Where(a => a.AppointmentDate >= startDate && a.AppointmentDate <= endDate)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.StartTime)
                .ToList();
        }

        public IEnumerable<Appointment> GetUpcomingAppointments(int days = 7)
        {
            var today = DateTime.UtcNow.Date;
            var futureDate = today.AddDays(days);

            return _db.Appointments
                .Include(a => a.Client)
                .Include(a => a.Doctor)
                .Where(a => a.AppointmentDate >= today && a.AppointmentDate <= futureDate)
                .Where(a => a.Status == "Scheduled")
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.StartTime)
                .ToList();
        }

        public IEnumerable<Appointment> GetByStatus(string status)
        {
            return _db.Appointments
                .Include(a => a.Client)
                .Include(a => a.Doctor)
                .Where(a => a.Status == status)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.StartTime)
                .ToList();
        }

        public bool HasConflict(int doctorId, DateTime date, TimeSpan startTime, TimeSpan endTime, int? excludeAppointmentId = null)
        {
            var query = _db.Appointments
                .Where(a => a.DoctorId == doctorId 
                    && a.AppointmentDate.Date == date.Date
                    && a.Status != "Cancelled");

            if (excludeAppointmentId.HasValue)
            {
                query = query.Where(a => a.Id != excludeAppointmentId.Value);
            }

            return query.Any(a => 
                (startTime >= a.StartTime && startTime < a.EndTime) ||
                (endTime > a.StartTime && endTime <= a.EndTime) ||
                (startTime <= a.StartTime && endTime >= a.EndTime));
        }

        public void Add(Appointment appointment)
        {
            _db.Appointments.Add(appointment);
        }

        public void Update(Appointment appointment)
        {
            _db.Appointments.Update(appointment);
        }

        public void Delete(Appointment appointment)
        {
            _db.Appointments.Remove(appointment);
        }

        public void Save()
        {
            _db.SaveChanges();
        }
    }
}