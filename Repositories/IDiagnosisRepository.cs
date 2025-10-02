using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface IDiagnosisRepository
    {
        void Add(Diagnosis diagnosis);
        void Update(Diagnosis diagnosis);
        void Delete(Diagnosis diagnosis);
        Diagnosis? GetById(int id);
        IEnumerable<Diagnosis> GetByClientId(int clientId);
        IEnumerable<Diagnosis> GetByDoctorId(int doctorId);
        IEnumerable<Diagnosis> GetActiveDiagnosesByClientId(int clientId);
        IEnumerable<Diagnosis> GetAll();
        void Save();
    }
}