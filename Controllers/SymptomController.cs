using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Repositories;
using FinalYearProject.Models;
using FinalYearProject.DTOs;
using FinalYearProject.Services;

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
        public async Task<IActionResult> AddSymptomToClient([FromBody] SymptomCreateDto request)
        {
            try
            {
                // Support both ID and Username
                Client client;
                if (!string.IsNullOrEmpty(request.ClientUsername))
                {
                    client = await _clientRepo.GetByUsernameAsync(request.ClientUsername);
                }
                else
                {
                    client = _clientRepo.GetById(request.ClientId);
                }

                if (client == null)
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Client not found"
                    });

                // Support both ID and Username for doctor
                Doctor doctor;
                if (!string.IsNullOrEmpty(request.DoctorUsername))
                {
                    doctor = await _doctorRepo.GetByUsernameAsync(request.DoctorUsername);
                }
                else
                {
                    doctor = _doctorRepo.GetById(request.DoctorId);
                }

                if (doctor == null)
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });

                var symptom = new Symptom
                {
                    Name = request.Name,
                    Description = request.Description,
                    SeverityLevel = request.SeverityLevel,
                    ClientId = client.Id,
                    AddedByDoctorId = doctor.Id,
                    Notes = request.Notes
                };

                _symptomRepo.Add(symptom);
                _symptomRepo.Save();

                return Ok(new ApiResponseDto<object>
                {
                    Success = true,
                    Data = new { Message = "Symptom added successfully", SymptomId = symptom.Id },
                    Message = "Symptom added successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = $"An error occurred: {ex.Message}"
                });
            }
        }

        // Client views their own symptoms
        [HttpGet("client/{clientId}")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public IActionResult GetClientSymptoms(int clientId)
        {
            try
            {
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

        // Add this new endpoint to get symptoms by client username
        [HttpGet("client/username/{clientUsername}")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public async Task<IActionResult> GetClientSymptomsByUsername(string clientUsername)
        {
            try
            {
                var client = await _clientRepo.GetByUsernameAsync(clientUsername);
                if (client == null)
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Client not found"
                    });

                var symptoms = _symptomRepo.GetActiveSymptomsByClientId(client.Id);

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

                return Ok(new ApiResponseDto<object>
                {
                    Success = true,
                    Data = result,
                    Message = "Symptoms retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = $"An error occurred: {ex.Message}"
                });
            }
        }

        // Doctor views symptoms they added
        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Doctor,Admin")]
        public IActionResult GetDoctorSymptoms(int doctorId)
        {
            try
            {
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
        public IActionResult UpdateSymptom(int id, [FromBody] SymptomUpdateDto request)
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
}