using FinalYearProject.Data;
using FinalYearProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Repositories
{
    public class AppointmentHistoryRepository : IAppointmentHistoryRepository
    {
        private readonly AppDbContext _db;

        public AppointmentHistoryRepository(AppDbContext db)
        {
            _db = db;
        }

        public IEnumerable<AppointmentHistory> GetAll()
        {
            return _db.AppointmentHistories
                .Include(ah => ah.Appointment)
                    .ThenInclude(a => a.Client)
                .Include(ah => ah.Appointment)
                    .ThenInclude(a => a.Doctor)
                .OrderByDescending(ah => ah.ChangedAt)
                .ToList();
        }

        public IEnumerable<AppointmentHistory> GetByAppointmentId(int appointmentId)
        {
            return _db.AppointmentHistories
                .Include(ah => ah.Appointment)
                    .ThenInclude(a => a.Client)
                .Include(ah => ah.Appointment)
                    .ThenInclude(a => a.Doctor)
                .Where(ah => ah.AppointmentId == appointmentId)
                .OrderByDescending(ah => ah.ChangedAt)
                .ToList();
        }

        public IEnumerable<AppointmentHistory> GetByClientId(int clientId)
        {
            return _db.AppointmentHistories
                .Include(ah => ah.Appointment)
                    .ThenInclude(a => a.Client)
                .Include(ah => ah.Appointment)
                    .ThenInclude(a => a.Doctor)
                .Where(ah => ah.Appointment.ClientId == clientId)
                .OrderByDescending(ah => ah.ChangedAt)
                .ToList();
        }

        public IEnumerable<AppointmentHistory> GetByDoctorId(int doctorId)
        {
            return _db.AppointmentHistories
                .Include(ah => ah.Appointment)
                    .ThenInclude(a => a.Client)
                .Include(ah => ah.Appointment)
                    .ThenInclude(a => a.Doctor)
                .Where(ah => ah.Appointment.DoctorId == doctorId)
                .OrderByDescending(ah => ah.ChangedAt)
                .ToList();
        }

        public IEnumerable<AppointmentHistory> GetByStatus(string status)
        {
            return _db.AppointmentHistories
                .Include(ah => ah.Appointment)
                    .ThenInclude(a => a.Client)
                .Include(ah => ah.Appointment)
                    .ThenInclude(a => a.Doctor)
                .Where(ah => ah.NewStatus == status)
                .OrderByDescending(ah => ah.ChangedAt)
                .ToList();
        }

        public IEnumerable<AppointmentHistory> GetByDateRange(DateTime startDate, DateTime endDate)
        {
            return _db.AppointmentHistories
                .Include(ah => ah.Appointment)
                    .ThenInclude(a => a.Client)
                .Include(ah => ah.Appointment)
                    .ThenInclude(a => a.Doctor)
                .Where(ah => ah.ChangedAt >= startDate && ah.ChangedAt <= endDate)
                .OrderByDescending(ah => ah.ChangedAt)
                .ToList();
        }

        public AppointmentHistory? GetById(int id)
        {
            return _db.AppointmentHistories
                .Include(ah => ah.Appointment)
                    .ThenInclude(a => a.Client)
                .Include(ah => ah.Appointment)
                    .ThenInclude(a => a.Doctor)
                .FirstOrDefault(ah => ah.Id == id);
        }

        public void Add(AppointmentHistory history)
        {
            _db.AppointmentHistories.Add(history);
        }

        public void Save()
        {
            _db.SaveChanges();
        }
    }
}