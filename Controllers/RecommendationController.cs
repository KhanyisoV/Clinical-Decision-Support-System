using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Repositories;
using FinalYearProject.Models;
using FinalYearProject.DTOs;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationController : ControllerBase
    {
        private readonly IRecommendationRepository _recommendationRepo;
        private readonly IClientRepository _clientRepo;
        private readonly IDoctorRepository _doctorRepo;

        public RecommendationController(
            IRecommendationRepository recommendationRepo,
            IClientRepository clientRepo,
            IDoctorRepository doctorRepo)
        {
            _recommendationRepo = recommendationRepo;
            _clientRepo = clientRepo;
            _doctorRepo = doctorRepo;
        }

        // ============================
        // Doctor Endpoints
        // ============================

        // Doctor creates recommendation
        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public IActionResult CreateRecommendation([FromBody] RecommendationCreateDto request)
        {
            var client = _clientRepo.GetById(request.ClientId);
            if (client == null) return NotFound("Client not found");

            var doctor = _doctorRepo.GetById(request.DoctorId);
            if (doctor == null) return NotFound("Doctor not found");

            var recommendation = new Recommendation
            {
                Title = request.Title,
                Description = request.Description,
                ClientId = request.ClientId,
                DoctorId = request.DoctorId
            };

            _recommendationRepo.Add(recommendation);
            _recommendationRepo.Save();

            return Ok(new { Message = "Recommendation created successfully", RecommendationId = recommendation.Id });
        }

        // Doctor updates recommendation
        [HttpPut("{id}")]
        [Authorize(Roles = "Doctor")]
        public IActionResult UpdateRecommendation(int id, [FromBody] RecommendationUpdateDto request)
        {
            var recommendation = _recommendationRepo.GetById(id);
            if (recommendation == null) return NotFound("Recommendation not found");

            if (!string.IsNullOrEmpty(request.Title)) recommendation.Title = request.Title;
            if (!string.IsNullOrEmpty(request.Description)) recommendation.Description = request.Description;
            if (request.IsActive.HasValue) recommendation.IsActive = request.IsActive.Value;

            _recommendationRepo.Update(recommendation);
            _recommendationRepo.Save();

            return Ok("Recommendation updated successfully");
        }

        // Doctor deletes recommendation
        [HttpDelete("{id}")]
        [Authorize(Roles = "Doctor")]
        public IActionResult DeleteRecommendation(int id)
        {
            var recommendation = _recommendationRepo.GetById(id);
            if (recommendation == null) return NotFound("Recommendation not found");

            _recommendationRepo.Delete(recommendation);
            _recommendationRepo.Save();

            return Ok("Recommendation deleted successfully");
        }

        // Doctor views recommendations they made
        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Doctor,Admin")]
        public IActionResult GetDoctorRecommendations(int doctorId)
        {
            var recommendations = _recommendationRepo.GetByDoctorId(doctorId);
            return Ok(recommendations);
        }

        // ============================
        // Client Endpoints
        // ============================

        // Client views their recommendations
        [HttpGet("client/{clientId}")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public IActionResult GetClientRecommendations(int clientId)
        {
            var recommendations = _recommendationRepo.GetByClientId(clientId);
            return Ok(recommendations);
        }

        // ============================
        // Admin Endpoints
        // ============================

        // Admin views all recommendations
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAllRecommendations()
        {
            var recommendations = _recommendationRepo.GetAll();
            return Ok(recommendations);
        }

        // Admin views recommendation by ID
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetRecommendationById(int id)
        {
            var recommendation = _recommendationRepo.GetById(id);
            if (recommendation == null) return NotFound("Recommendation not found");

            return Ok(recommendation);
        }
    }
}
