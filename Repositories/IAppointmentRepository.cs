using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface IAppointmentRepository
    {
        IEnumerable<Appointment> GetAll();
        Appointment? GetById(int id);
        IEnumerable<Appointment> GetByClientId(int clientId);
        IEnumerable<Appointment> GetByDoctorId(int doctorId);
        IEnumerable<Appointment> GetByDateRange(DateTime startDate, DateTime endDate);
        IEnumerable<Appointment> GetUpcomingAppointments(int days = 7);
        IEnumerable<Appointment> GetByStatus(string status);
        bool HasConflict(int doctorId, DateTime date, TimeSpan startTime, TimeSpan endTime, int? excludeAppointmentId = null);
        void Add(Appointment appointment);
        void Update(Appointment appointment);
        void Delete(Appointment appointment);
        void Save();
    }
}