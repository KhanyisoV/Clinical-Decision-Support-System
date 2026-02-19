using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Repositories;
using FinalYearProject.Models;
using FinalYearProject.DTOs;
using FinalYearProject.Services;
using FinalYearProject.Data;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SymptomsController : ControllerBase
    {
        private readonly ISymptomRepository _symptomRepo;
        private readonly IClientRepository _clientRepo;
        private readonly IDoctorRepository _doctorRepo;
        private readonly AppDbContext _context;

        public SymptomsController(
            ISymptomRepository symptomRepo, 
            IClientRepository clientRepo, 
            IDoctorRepository doctorRepo,
            AppDbContext context)
        {
            _symptomRepo = symptomRepo;
            _clientRepo = clientRepo;
            _doctorRepo = doctorRepo;
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }
       

        // Doctor adds symptom to client
       // ✅ Doctor adds symptom to a client
        [HttpPost("add-to-client")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> AddSymptomToClient([FromBody] SymptomCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Invalid data provided",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var client = await _context.Clients.FindAsync(createDto.ClientId);
                if (client == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = $"Client with ID {createDto.ClientId} not found"
                    });
                }

                var doctor = await _context.Doctors.FindAsync(createDto.AddedByDoctorId);
                if (doctor == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = $"Doctor with ID {createDto.AddedByDoctorId} not found"
                    });
                }
                // Create new entity from DTO
                var symptom = new Symptom
                {
                    Name = createDto.Name,
                    Description = createDto.Description,
                    SeverityLevel = createDto.SeverityLevel,
                    Notes = createDto.Notes,
                    ClientId = createDto.ClientId,
                    AddedByDoctorId = createDto.AddedByDoctorId,
                    IsActive = true,
                    DateReported = DateTime.UtcNow
                };

                // Save to database
                _context.Symptoms.Add(symptom);
                await _context.SaveChangesAsync();


                var symptomDto = new SymptomDto
                {
                    Id = symptom.Id,
                    Name = symptom.Name,
                    Description = symptom.Description,
                    SeverityLevel = symptom.SeverityLevel,
                    Notes = symptom.Notes,
                    ClientId = symptom.ClientId,
                    AddedByDoctorId = symptom.AddedByDoctorId,
                    IsActive = symptom.IsActive,
                    DateReported = symptom.DateReported
                };

                return Ok(new ApiResponseDto<SymptomDto>
                {
                    Success = true,
                    Message = "Symptom added successfully",
                    Data = symptomDto
                });

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding symptom: {ex.Message}");
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while adding the symptom",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
        [HttpGet("client/username/{clientUsername}")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public async Task<IActionResult> GetSymptomsByClientUsername(string clientUsername)
        {
            var client = await _clientRepo.GetByUsernameAsync(clientUsername);
            if (client == null)
                return NotFound(new ApiResponseDto
                {
                    Success = false,
                    Message = "Client not found"
                });

            
            var symptoms = _symptomRepo.GetByClientId(client.Id)
            .Select(s => new SymptomDto {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                ClientUserName = s.Client.UserName,
                AddedByDoctorUserName = s.AddedByDoctor.UserName
            }).ToList();

            return Ok(new ApiResponseDto<object>
            {
                Success = true,
                Data = symptoms,
                Message = "Symptoms retrieved successfully"
            });
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
        // ✅ Update symptom
        [HttpPut("{symptomId}")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> UpdateSymptom(int symptomId, [FromBody] SymptomUpdateDto updateDto)
        {
            try
            {
                var symptom = await _context.Symptoms.FindAsync(symptomId);
                if (symptom == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Symptom not found"
                    });
                }

                if (!string.IsNullOrEmpty(updateDto.Name))
                    symptom.Name = updateDto.Name;

                if (!string.IsNullOrEmpty(updateDto.Description))
                    symptom.Description = updateDto.Description;

                if (updateDto.SeverityLevel.HasValue)
                    symptom.SeverityLevel = updateDto.SeverityLevel.Value;

                if (!string.IsNullOrEmpty(updateDto.Notes))
                    symptom.Notes = updateDto.Notes;

                if (updateDto.IsActive.HasValue)
                    symptom.IsActive = updateDto.IsActive.Value;

                if (updateDto.DateResolved.HasValue)
                    symptom.DateResolved = updateDto.DateResolved.Value;

                symptom.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Symptom updated successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating symptom: {ex.Message}");
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating the symptom",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // ✅ Delete symptom
        [HttpDelete("{id}")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> DeleteSymptom(int id)
        {
            try
            {
                var symptom = await _context.Symptoms.FindAsync(id);
                if (symptom == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Symptom not found"
                    });
                }

                _context.Symptoms.Remove(symptom);
                await _context.SaveChangesAsync();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Symptom deleted successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting symptom: {ex.Message}");
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting the symptom",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}