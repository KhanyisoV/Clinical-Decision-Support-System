using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface ISymptomRepository
    {
        void Add(Symptom symptom);
        void Update(Symptom symptom);
        void Delete(Symptom symptom);
        Symptom? GetById(int id);
        IEnumerable<Symptom> GetByClientId(int clientId);
        IEnumerable<Symptom> GetByDoctorId(int doctorId);
        IEnumerable<Symptom> GetActiveSymptomsByClientId(int clientId);
        void Save();
    }
}
