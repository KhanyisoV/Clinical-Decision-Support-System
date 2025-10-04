using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface IAppointmentHistoryRepository
    {
        IEnumerable<AppointmentHistory> GetAll();
        IEnumerable<AppointmentHistory> GetByAppointmentId(int appointmentId);
        IEnumerable<AppointmentHistory> GetByClientId(int clientId);
        IEnumerable<AppointmentHistory> GetByDoctorId(int doctorId);
        IEnumerable<AppointmentHistory> GetByStatus(string status);
        IEnumerable<AppointmentHistory> GetByDateRange(DateTime startDate, DateTime endDate);
        AppointmentHistory? GetById(int id);
        void Add(AppointmentHistory history);
        void Save();
    }
}