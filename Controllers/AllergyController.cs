using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Data;
using FinalYearProject.Models;
using FinalYearProject.DTOs;
using FinalYearProject.Repositories;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All authenticated users can access
    public class AllergyController : ControllerBase
    {
        private readonly IAllergyRepository _allergyRepo;
        private readonly AppDbContext _db;

        public AllergyController(IAllergyRepository allergyRepo, AppDbContext db)
        {
            _allergyRepo = allergyRepo;
            _db = db;
        }

        // GET: api/allergy - All users can view
        [HttpGet]
        public async Task<IActionResult> GetAllAllergies()
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                IEnumerable<Allergy> allergies;

                // If user is a client, only show their own allergies
                if (userRole == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null)
                    {
                        return NotFound(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Client not found"
                        });
                    }
                    allergies = await _allergyRepo.GetByClientIdAsync(client.Id);
                }
                else
                {
                    // Admin and Doctor can see all allergies
                    allergies = await _allergyRepo.GetAllAsync();
                }

                var allergyDtos = allergies.Select(a => new AllergyDto
                {
                    Id = a.Id,
                    ClientId = a.ClientId,
                    ClientName = $"{a.Client.FirstName} {a.Client.LastName}",
                    AllergyName = a.AllergyName,
                    AllergyType = a.AllergyType,
                    Severity = a.Severity,
                    Reaction = a.Reaction,
                    Notes = a.Notes,
                    DiagnosedDate = a.DiagnosedDate,
                    IsActive = a.IsActive,
                    Treatment = a.Treatment,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    CreatedBy = a.CreatedBy,
                    CreatedByRole = a.CreatedByRole
                }).ToList();

                return Ok(new ApiResponseDto<List<AllergyDto>>
                {
                    Success = true,
                    Data = allergyDtos,
                    Message = "Allergies retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving allergies",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/allergy/{id} - All users can view
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAllergyById(int id)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                var allergy = await _allergyRepo.GetByIdAsync(id);

                if (allergy == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Allergy not found"
                    });
                }

                // If user is a client, verify they own this allergy
                if (userRole == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null || allergy.ClientId != client.Id)
                    {
                        return Forbid();
                    }
                }

                var allergyDto = new AllergyDto
                {
                    Id = allergy.Id,
                    ClientId = allergy.ClientId,
                    ClientName = $"{allergy.Client.FirstName} {allergy.Client.LastName}",
                    AllergyName = allergy.AllergyName,
                    AllergyType = allergy.AllergyType,
                    Severity = allergy.Severity,
                    Reaction = allergy.Reaction,
                    Notes = allergy.Notes,
                    DiagnosedDate = allergy.DiagnosedDate,
                    IsActive = allergy.IsActive,
                    Treatment = allergy.Treatment,
                    CreatedAt = allergy.CreatedAt,
                    UpdatedAt = allergy.UpdatedAt,
                    CreatedBy = allergy.CreatedBy,
                    CreatedByRole = allergy.CreatedByRole
                };

                return Ok(new ApiResponseDto<AllergyDto>
                {
                    Success = true,
                    Data = allergyDto,
                    Message = "Allergy retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving allergy",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/allergy/client/{clientId} - All users can view (with restrictions)
        [HttpGet("client/{clientId}")]
        public async Task<IActionResult> GetAllergiesByClientId(int clientId)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                // If user is a client, verify they are requesting their own allergies
                if (userRole == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null || client.Id != clientId)
                    {
                        return Forbid();
                    }
                }

                var allergies = await _allergyRepo.GetByClientIdAsync(clientId);

                var allergyDtos = allergies.Select(a => new AllergyDto
                {
                    Id = a.Id,
                    ClientId = a.ClientId,
                    ClientName = $"{a.Client.FirstName} {a.Client.LastName}",
                    AllergyName = a.AllergyName,
                    AllergyType = a.AllergyType,
                    Severity = a.Severity,
                    Reaction = a.Reaction,
                    Notes = a.Notes,
                    DiagnosedDate = a.DiagnosedDate,
                    IsActive = a.IsActive,
                    Treatment = a.Treatment,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    CreatedBy = a.CreatedBy,
                    CreatedByRole = a.CreatedByRole
                }).ToList();

                return Ok(new ApiResponseDto<List<AllergyDto>>
                {
                    Success = true,
                    Data = allergyDtos,
                    Message = "Allergies retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving allergies",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/allergy/client/{clientId}/active - Get active allergies only
        [HttpGet("client/{clientId}/active")]
        public async Task<IActionResult> GetActiveAllergiesByClientId(int clientId)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                // If user is a client, verify they are requesting their own allergies
                if (userRole == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null || client.Id != clientId)
                    {
                        return Forbid();
                    }
                }

                var allergies = await _allergyRepo.GetActiveByClientIdAsync(clientId);

                var allergyDtos = allergies.Select(a => new AllergyDto
                {
                    Id = a.Id,
                    ClientId = a.ClientId,
                    ClientName = $"{a.Client.FirstName} {a.Client.LastName}",
                    AllergyName = a.AllergyName,
                    AllergyType = a.AllergyType,
                    Severity = a.Severity,
                    Reaction = a.Reaction,
                    Notes = a.Notes,
                    DiagnosedDate = a.DiagnosedDate,
                    IsActive = a.IsActive,
                    Treatment = a.Treatment,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    CreatedBy = a.CreatedBy,
                    CreatedByRole = a.CreatedByRole
                }).ToList();

                return Ok(new ApiResponseDto<List<AllergyDto>>
                {
                    Success = true,
                    Data = allergyDtos,
                    Message = "Active allergies retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving active allergies",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/allergy/life-threatening - Get life-threatening allergies
        [HttpGet("life-threatening")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GetLifeThreateningAllergies()
        {
            try
            {
                var allergies = await _allergyRepo.GetLifeThreateningAllergiesAsync();

                var allergyDtos = allergies.Select(a => new AllergyDto
                {
                    Id = a.Id,
                    ClientId = a.ClientId,
                    ClientName = $"{a.Client.FirstName} {a.Client.LastName}",
                    AllergyName = a.AllergyName,
                    AllergyType = a.AllergyType,
                    Severity = a.Severity,
                    Reaction = a.Reaction,
                    Notes = a.Notes,
                    DiagnosedDate = a.DiagnosedDate,
                    IsActive = a.IsActive,
                    Treatment = a.Treatment,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    CreatedBy = a.CreatedBy,
                    CreatedByRole = a.CreatedByRole
                }).ToList();

                return Ok(new ApiResponseDto<List<AllergyDto>>
                {
                    Success = true,
                    Data = allergyDtos,
                    Message = "Life-threatening allergies retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving life-threatening allergies",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // POST: api/allergy - Client and Doctor only
        [HttpPost]
        [Authorize(Roles = "Client,Doctor")]
        public async Task<IActionResult> CreateAllergy([FromBody] AllergyCreateDto request)
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

                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                // If user is a client, verify they are creating their own allergy
                if (userRole == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null || client.Id != request.ClientId)
                    {
                        return Forbid();
                    }
                }

                // Verify client exists
                var clientExists = await _db.Clients.FindAsync(request.ClientId);
                if (clientExists == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Client not found"
                    });
                }

                var allergy = new Allergy
                {
                    ClientId = request.ClientId,
                    AllergyName = request.AllergyName,
                    AllergyType = request.AllergyType,
                    Severity = request.Severity,
                    Reaction = request.Reaction,
                    Notes = request.Notes,
                    DiagnosedDate = request.DiagnosedDate,
                    IsActive = request.IsActive,
                    Treatment = request.Treatment,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = username ?? "Unknown",
                    CreatedByRole = userRole ?? "Unknown"
                };

                await _allergyRepo.AddAsync(allergy);

                // Reload with client data
                var createdAllergy = await _allergyRepo.GetByIdAsync(allergy.Id);

                var allergyDto = new AllergyDto
                {
                    Id = createdAllergy!.Id,
                    ClientId = createdAllergy.ClientId,
                    ClientName = $"{createdAllergy.Client.FirstName} {createdAllergy.Client.LastName}",
                    AllergyName = createdAllergy.AllergyName,
                    AllergyType = createdAllergy.AllergyType,
                    Severity = createdAllergy.Severity,
                    Reaction = createdAllergy.Reaction,
                    Notes = createdAllergy.Notes,
                    DiagnosedDate = createdAllergy.DiagnosedDate,
                    IsActive = createdAllergy.IsActive,
                    Treatment = createdAllergy.Treatment,
                    CreatedAt = createdAllergy.CreatedAt,
                    CreatedBy = createdAllergy.CreatedBy,
                    CreatedByRole = createdAllergy.CreatedByRole
                };

                return Ok(new ApiResponseDto<AllergyDto>
                {
                    Success = true,
                    Data = allergyDto,
                    Message = "Allergy created successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while creating allergy",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // PUT: api/allergy/{id} - Client and Doctor only
        [HttpPut("{id}")]
        [Authorize(Roles = "Client,Doctor")]
        public async Task<IActionResult> UpdateAllergy(int id, [FromBody] AllergyUpdateDto request)
        {
            try
            {
                if (!await _allergyRepo.ExistsAsync(id))
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Allergy not found"
                    });
                }

                var allergy = await _allergyRepo.GetByIdAsync(id);
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                // If user is a client, verify they own this allergy
                if (userRole == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null || allergy!.ClientId != client.Id)
                    {
                        return Forbid();
                    }
                }

                // Update fields if provided
                if (request.AllergyName != null) allergy!.AllergyName = request.AllergyName;
                if (request.AllergyType != null) allergy!.AllergyType = request.AllergyType;
                if (request.Severity != null) allergy!.Severity = request.Severity;
                if (request.Reaction != null) allergy!.Reaction = request.Reaction;
                if (request.Notes != null) allergy!.Notes = request.Notes;
                if (request.DiagnosedDate.HasValue) allergy!.DiagnosedDate = request.DiagnosedDate.Value;
                if (request.IsActive.HasValue) allergy!.IsActive = request.IsActive.Value;
                if (request.Treatment != null) allergy!.Treatment = request.Treatment;

                await _allergyRepo.UpdateAsync(allergy!);

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Allergy updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating allergy",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // DELETE: api/allergy/{id} - Client and Doctor only
        [HttpDelete("{id}")]
        [Authorize(Roles = "Client,Doctor")]
        public async Task<IActionResult> DeleteAllergy(int id)
        {
            try
            {
                if (!await _allergyRepo.ExistsAsync(id))
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Allergy not found"
                    });
                }

                var allergy = await _allergyRepo.GetByIdAsync(id);
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                // If user is a client, verify they own this allergy
                if (userRole == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null || allergy!.ClientId != client.Id)
                    {
                        return Forbid();
                    }
                }

                await _allergyRepo.DeleteAsync(id);

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Allergy deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting allergy",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}