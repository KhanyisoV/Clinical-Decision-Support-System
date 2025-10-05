using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FinalYearProject.Data;
using FinalYearProject.Models;
using FinalYearProject.DTOs;
using System.Security.Claims;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All authenticated users can access, but permissions vary
    public class LabResultController : ControllerBase
    {
        private readonly AppDbContext _db;

        public LabResultController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/labresult - All users can view
        [HttpGet]
        public async Task<IActionResult> GetAllLabResults()
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                IQueryable<LabResult> query = _db.LabResults.Include(lr => lr.Client);

                // If user is a client, only show their own results
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
                    query = query.Where(lr => lr.ClientId == client.Id);
                }

                var labResults = await query
                    .Select(lr => new LabResultDto
                    {
                        Id = lr.Id,
                        ClientId = lr.ClientId,
                        ClientName = $"{lr.Client.FirstName} {lr.Client.LastName}",
                        TestName = lr.TestName,
                        TestType = lr.TestType,
                        TestDate = lr.TestDate,
                        Result = lr.Result,
                        Status = lr.Status,
                        Notes = lr.Notes,
                        ReferenceRange = lr.ReferenceRange,
                        IsAbnormal = lr.IsAbnormal,
                        PerformedBy = lr.PerformedBy,
                        CreatedAt = lr.CreatedAt,
                        UpdatedAt = lr.UpdatedAt,
                        CreatedByAdmin = lr.CreatedByAdmin
                    })
                    .OrderByDescending(lr => lr.TestDate)
                    .ToListAsync();

                return Ok(new ApiResponseDto<List<LabResultDto>>
                {
                    Success = true,
                    Data = labResults,
                    Message = "Lab results retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving lab results",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/labresult/{id} - All users can view
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLabResultById(int id)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                var labResult = await _db.LabResults
                    .Include(lr => lr.Client)
                    .FirstOrDefaultAsync(lr => lr.Id == id);

                if (labResult == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Lab result not found"
                    });
                }

                // If user is a client, verify they own this result
                if (userRole == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null || labResult.ClientId != client.Id)
                    {
                        return Forbid();
                    }
                }

                var labResultDto = new LabResultDto
                {
                    Id = labResult.Id,
                    ClientId = labResult.ClientId,
                    ClientName = $"{labResult.Client.FirstName} {labResult.Client.LastName}",
                    TestName = labResult.TestName,
                    TestType = labResult.TestType,
                    TestDate = labResult.TestDate,
                    Result = labResult.Result,
                    Status = labResult.Status,
                    Notes = labResult.Notes,
                    ReferenceRange = labResult.ReferenceRange,
                    IsAbnormal = labResult.IsAbnormal,
                    PerformedBy = labResult.PerformedBy,
                    CreatedAt = labResult.CreatedAt,
                    UpdatedAt = labResult.UpdatedAt,
                    CreatedByAdmin = labResult.CreatedByAdmin
                };

                return Ok(new ApiResponseDto<LabResultDto>
                {
                    Success = true,
                    Data = labResultDto,
                    Message = "Lab result retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving lab result",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/labresult/client/{clientId} - All users can view (with restrictions)
        [HttpGet("client/{clientId}")]
        public async Task<IActionResult> GetLabResultsByClientId(int clientId)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                // If user is a client, verify they are requesting their own results
                if (userRole == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null || client.Id != clientId)
                    {
                        return Forbid();
                    }
                }

                var labResults = await _db.LabResults
                    .Include(lr => lr.Client)
                    .Where(lr => lr.ClientId == clientId)
                    .Select(lr => new LabResultDto
                    {
                        Id = lr.Id,
                        ClientId = lr.ClientId,
                        ClientName = $"{lr.Client.FirstName} {lr.Client.LastName}",
                        TestName = lr.TestName,
                        TestType = lr.TestType,
                        TestDate = lr.TestDate,
                        Result = lr.Result,
                        Status = lr.Status,
                        Notes = lr.Notes,
                        ReferenceRange = lr.ReferenceRange,
                        IsAbnormal = lr.IsAbnormal,
                        PerformedBy = lr.PerformedBy,
                        CreatedAt = lr.CreatedAt,
                        UpdatedAt = lr.UpdatedAt,
                        CreatedByAdmin = lr.CreatedByAdmin
                    })
                    .OrderByDescending(lr => lr.TestDate)
                    .ToListAsync();

                return Ok(new ApiResponseDto<List<LabResultDto>>
                {
                    Success = true,
                    Data = labResults,
                    Message = "Lab results retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving lab results",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // POST: api/labresult - Admin only
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateLabResult([FromBody] LabResultCreateDto request)
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

                // Verify client exists
                var client = await _db.Clients.FindAsync(request.ClientId);
                if (client == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Client not found"
                    });
                }

                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                var labResult = new LabResult
                {
                    ClientId = request.ClientId,
                    TestName = request.TestName,
                    TestType = request.TestType,
                    TestDate = request.TestDate,
                    Result = request.Result,
                    Status = request.Status,
                    Notes = request.Notes,
                    ReferenceRange = request.ReferenceRange,
                    IsAbnormal = request.IsAbnormal,
                    PerformedBy = request.PerformedBy,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByAdmin = username ?? "Unknown"
                };

                _db.LabResults.Add(labResult);
                await _db.SaveChangesAsync();

                var labResultDto = new LabResultDto
                {
                    Id = labResult.Id,
                    ClientId = labResult.ClientId,
                    ClientName = $"{client.FirstName} {client.LastName}",
                    TestName = labResult.TestName,
                    TestType = labResult.TestType,
                    TestDate = labResult.TestDate,
                    Result = labResult.Result,
                    Status = labResult.Status,
                    Notes = labResult.Notes,
                    ReferenceRange = labResult.ReferenceRange,
                    IsAbnormal = labResult.IsAbnormal,
                    PerformedBy = labResult.PerformedBy,
                    CreatedAt = labResult.CreatedAt,
                    CreatedByAdmin = labResult.CreatedByAdmin
                };

                return Ok(new ApiResponseDto<LabResultDto>
                {
                    Success = true,
                    Data = labResultDto,
                    Message = "Lab result created successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while creating lab result",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // PUT: api/labresult/{id} - Admin only
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateLabResult(int id, [FromBody] LabResultUpdateDto request)
        {
            try
            {
                var labResult = await _db.LabResults.FindAsync(id);
                if (labResult == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Lab result not found"
                    });
                }

                // Update fields if provided
                if (request.TestName != null) labResult.TestName = request.TestName;
                if (request.TestType != null) labResult.TestType = request.TestType;
                if (request.TestDate.HasValue) labResult.TestDate = request.TestDate.Value;
                if (request.Result != null) labResult.Result = request.Result;
                if (request.Status != null) labResult.Status = request.Status;
                if (request.Notes != null) labResult.Notes = request.Notes;
                if (request.ReferenceRange != null) labResult.ReferenceRange = request.ReferenceRange;
                if (request.IsAbnormal.HasValue) labResult.IsAbnormal = request.IsAbnormal.Value;
                if (request.PerformedBy != null) labResult.PerformedBy = request.PerformedBy;

                labResult.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Lab result updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating lab result",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // DELETE: api/labresult/{id} - Admin only
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteLabResult(int id)
        {
            try
            {
                var labResult = await _db.LabResults.FindAsync(id);
                if (labResult == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Lab result not found"
                    });
                }

                _db.LabResults.Remove(labResult);
                await _db.SaveChangesAsync();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Lab result deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting lab result",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}