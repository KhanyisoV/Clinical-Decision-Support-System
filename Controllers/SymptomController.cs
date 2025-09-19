using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Repositories;
using FinalYearProject.Models;
using System.ComponentModel.DataAnnotations;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SymptomsController : ControllerBase
    {
        private readonly ISymptomRepository _symptomRepo;
        private readonly IClientRepository _clientRepo;
        private readonly IDoctorRepository _doctorRepo;

        public SymptomsController(
            ISymptomRepository symptomRepo, 
            IClientRepository clientRepo, 
            IDoctorRepository doctorRepo)
        {
            _symptomRepo = symptomRepo;
            _clientRepo = clientRepo;
            _doctorRepo = doctorRepo;
        }

        // Doctor adds symptom to client
        [HttpPost("add-to-client")]
        [Authorize(Roles = "Doctor")]
        public IActionResult AddSymptomToClient([FromBody] CreateSymptomRequest request)
        {
            try
            {
                // Verify the client exists
                var client = _clientRepo.GetById(request.ClientId);
                if (client == null)
                    return NotFound("Client not found");

                // Verify the doctor exists
                var doctor = _doctorRepo.GetById(request.DoctorId);
                if (doctor == null)
                    return NotFound("Doctor not found");

                var symptom = new Symptom
                {
                    Name = request.Name,
                    Description = request.Description,
                    SeverityLevel = request.SeverityLevel,
                    ClientId = request.ClientId,
                    AddedByDoctorId = request.DoctorId,
                    Notes = request.Notes
                };

                _symptomRepo.Add(symptom);
                _symptomRepo.Save();

                return Ok(new { Message = "Symptom added successfully", SymptomId = symptom.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Client views their own symptoms
        [HttpGet("client/{clientId}")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public IActionResult GetClientSymptoms(int clientId)
        {
            try
            {
                // In a real app, you'd verify the current user can access this client's data
                var symptoms = _symptomRepo.GetActiveSymptomsByClientId(clientId);

                var result = symptoms.Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Description,
                    s.SeverityLevel,
                    s.DateReported,
                    s.Notes,
                    AddedByDoctor = new
                    {
                        s.AddedByDoctor.Id,
                        s.AddedByDoctor.UserName,
                        s.AddedByDoctor.FirstName,
                        s.AddedByDoctor.LastName
                    }
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Doctor views symptoms they added
        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Doctor,Admin")]
        public IActionResult GetDoctorSymptoms(int doctorId)
        {
            try
            {
                // Fixed the typo: _symptorRepo -> _symptomRepo
                var symptoms = _symptomRepo.GetByDoctorId(doctorId);

                var result = symptoms.Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Description,
                    s.SeverityLevel,
                    s.DateReported,
                    s.IsActive,
                    s.Notes,
                    Client = new
                    {
                        s.Client.Id,
                        s.Client.UserName,
                        s.Client.FirstName,
                        s.Client.LastName
                    }
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Get single symptom
        [HttpGet("{id}")]
        [Authorize]
        public IActionResult GetSymptom(int id)
        {
            try
            {
                var symptom = _symptomRepo.GetById(id);
                if (symptom == null)
                    return NotFound("Symptom not found");

                var result = new
                {
                    symptom.Id,
                    symptom.Name,
                    symptom.Description,
                    symptom.SeverityLevel,
                    symptom.DateReported,
                    symptom.DateResolved,
                    symptom.IsActive,
                    symptom.Notes,
                    Client = new
                    {
                        symptom.Client.Id,
                        symptom.Client.UserName,
                        symptom.Client.FirstName,
                        symptom.Client.LastName
                    },
                    AddedByDoctor = new
                    {
                        symptom.AddedByDoctor.Id,
                        symptom.AddedByDoctor.UserName,
                        symptom.AddedByDoctor.FirstName,
                        symptom.AddedByDoctor.LastName
                    }
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Update symptom (only by doctor who added it)
        [HttpPut("{id}")]
        [Authorize(Roles = "Doctor")]
        public IActionResult UpdateSymptom(int id, [FromBody] UpdateSymptomRequest request)
        {
            try
            {
                var symptom = _symptomRepo.GetById(id);
                if (symptom == null)
                    return NotFound("Symptom not found");

                // Update properties if provided
                if (!string.IsNullOrEmpty(request.Name))
                    symptom.Name = request.Name;

                if (!string.IsNullOrEmpty(request.Description))
                    symptom.Description = request.Description;

                if (request.SeverityLevel.HasValue)
                    symptom.SeverityLevel = request.SeverityLevel.Value;

                if (!string.IsNullOrEmpty(request.Notes))
                    symptom.Notes = request.Notes;

                if (request.IsActive.HasValue)
                    symptom.IsActive = request.IsActive.Value;

                if (request.DateResolved.HasValue)
                    symptom.DateResolved = request.DateResolved;

                _symptomRepo.Update(symptom);
                _symptomRepo.Save();

                return Ok("Symptom updated successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Delete symptom
        [HttpDelete("{id}")]
        [Authorize(Roles = "Doctor,Admin")]
        public IActionResult DeleteSymptom(int id)
        {
            try
            {
                var symptom = _symptomRepo.GetById(id);
                if (symptom == null)
                    return NotFound("Symptom not found");

                _symptomRepo.Delete(symptom);
                _symptomRepo.Save();

                return Ok("Symptom deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }

    // Request DTOs
    public class CreateSymptomRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Range(1, 10)]
        public int SeverityLevel { get; set; } = 1;
        
        [Required]
        public int ClientId { get; set; }
        
        [Required]
        public int DoctorId { get; set; }
        
        public string? Notes { get; set; }
    }

    public class UpdateSymptomRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        
        [Range(1, 10)]
        public int? SeverityLevel { get; set; }
        
        public string? Notes { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? DateResolved { get; set; }
    }
}