using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface IClinicalObservationRepository
    {
        void Add(ClinicalObservation observation);
        void Update(ClinicalObservation observation);
        void Delete(ClinicalObservation observation);
        ClinicalObservation? GetById(int id);
        IEnumerable<ClinicalObservation> GetByClientId(int clientId);
        IEnumerable<ClinicalObservation> GetByDoctorId(int doctorId);
        IEnumerable<ClinicalObservation> GetAll();

        // Add this method
        ClinicalObservation? GetLatestByClientId(int clientId);

        void Save();
    }

}
