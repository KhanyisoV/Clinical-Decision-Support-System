using FinalYearProject.Models;

namespace FinalYearProject.Repositories
{
    public interface IRecommendationRepository
    {
        void Add(Recommendation recommendation);
        void Update(Recommendation recommendation);
        void Delete(Recommendation recommendation);

        Recommendation? GetById(int id);
        IEnumerable<Recommendation> GetByClientId(int clientId);
        IEnumerable<Recommendation> GetByDoctorId(int doctorId);
        IEnumerable<Recommendation> GetAll();

        void Save();
    }
}



