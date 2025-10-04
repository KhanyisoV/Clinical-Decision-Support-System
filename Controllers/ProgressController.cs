using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FinalYearProject.Data;
using FinalYearProject.Models;
using FinalYearProject.DTOs;
using FinalYearProject.Repositories;
using System.Security.Claims;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProgressController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IProgressRepository _progressRepository;

        public ProgressController(AppDbContext db, IProgressRepository progressRepository)
        {
            _db = db;
            _progressRepository = progressRepository;
        }

        // GET: api/progress - Patients and Admins can view, filtered by role
        [HttpGet]
        public async Task<IActionResult> GetProgress()
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                IEnumerable<Progress> progressList;

                // Client can only view their own progress
                if (role == "Client")
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
                    progressList = await _progressRepository.GetByClientIdAsync(client.Id);
                }
                // Doctor can view progress they recorded or for their assigned clients
                else if (role == "Doctor")
                {
                    var doctor = await _db.Doctors
                        .Include(d => d.AssignedClients)
                        .FirstOrDefaultAsync(d => d.UserName == username);
                    
                    if (doctor == null)
                    {
                        return NotFound(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Doctor not found"
                        });
                    }

                    var assignedClientIds = doctor.AssignedClients.Select(c => c.Id).ToList();
                    var doctorProgress = await _progressRepository.GetByDoctorIdAsync(doctor.Id);
                    var clientProgress = await _progressRepository.GetByClientIdsAsync(assignedClientIds);
                    
                    progressList = doctorProgress.Union(clientProgress).Distinct();
                }
                // Admin can view all
                else
                {
                    progressList = await _progressRepository.GetAllAsync();
                }

                var progressDtos = progressList.Select(p => MapToDto(p)).ToList();

                return Ok(new ApiResponseDto<List<ProgressDto>>
                {
                    Success = true,
                    Data = progressDtos,
                    Message = "Progress entries retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving progress entries",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/progress/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProgressById(int id)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                var progress = await _progressRepository.GetByIdAsync(id);

                if (progress == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Progress entry not found"
                    });
                }

                // Authorization check
                if (role == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null || progress.ClientId != client.Id)
                    {
                        return Forbid();
                    }
                }
                else if (role == "Doctor")
                {
                    var doctor = await _db.Doctors
                        .Include(d => d.AssignedClients)
                        .FirstOrDefaultAsync(d => d.UserName == username);
                    
                    if (doctor == null)
                    {
                        return Forbid();
                    }

                    var assignedClientIds = doctor.AssignedClients.Select(c => c.Id).ToList();
                    if (progress.RecordedByDoctorId != doctor.Id && !assignedClientIds.Contains(progress.ClientId))
                    {
                        return Forbid();
                    }
                }

                var progressDto = MapToDto(progress);

                return Ok(new ApiResponseDto<ProgressDto>
                {
                    Success = true,
                    Data = progressDto,
                    Message = "Progress entry retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving progress entry",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/progress/client/{clientId}
        [HttpGet("client/{clientId}")]
        public async Task<IActionResult> GetProgressByClient(int clientId)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // Authorization check
                if (role == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null || client.Id != clientId)
                    {
                        return Forbid();
                    }
                }

                var progressList = await _progressRepository.GetByClientIdAsync(clientId);
                var progressDtos = progressList.Select(p => MapToDto(p)).ToList();

                return Ok(new ApiResponseDto<List<ProgressDto>>
                {
                    Success = true,
                    Data = progressDtos,
                    Message = "Client progress entries retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving client progress",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/progress/diagnosis/{diagnosisId}
        [HttpGet("diagnosis/{diagnosisId}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GetProgressByDiagnosis(int diagnosisId)
        {
            try
            {
                var progressList = await _progressRepository.GetByDiagnosisIdAsync(diagnosisId);
                var progressDtos = progressList.Select(p => MapToDto(p)).ToList();

                return Ok(new ApiResponseDto<List<ProgressDto>>
                {
                    Success = true,
                    Data = progressDtos,
                    Message = "Progress entries for diagnosis retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving progress entries",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/progress/treatment/{treatmentId}
        [HttpGet("treatment/{treatmentId}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GetProgressByTreatment(int treatmentId)
        {
            try
            {
                var progressList = await _progressRepository.GetByTreatmentIdAsync(treatmentId);
                var progressDtos = progressList.Select(p => MapToDto(p)).ToList();

                return Ok(new ApiResponseDto<List<ProgressDto>>
                {
                    Success = true,
                    Data = progressDtos,
                    Message = "Progress entries for treatment retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving progress entries",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/progress/status/{status}
        [HttpGet("status/{status}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GetProgressByStatus(string status)
        {
            try
            {
                var progressList = await _progressRepository.GetByStatusAsync(status);
                var progressDtos = progressList.Select(p => MapToDto(p)).ToList();

                return Ok(new ApiResponseDto<List<ProgressDto>>
                {
                    Success = true,
                    Data = progressDtos,
                    Message = $"Progress entries with status '{status}' retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving progress entries",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/progress/daterange
        [HttpGet("daterange")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GetProgressByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                if (startDate > endDate)
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Start date must be before or equal to end date"
                    });
                }

                var progressList = await _progressRepository.GetByDateRangeAsync(startDate, endDate);
                var progressDtos = progressList.Select(p => MapToDto(p)).ToList();

                return Ok(new ApiResponseDto<List<ProgressDto>>
                {
                    Success = true,
                    Data = progressDtos,
                    Message = "Progress entries in date range retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving progress entries",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // POST: api/progress - Only Doctors can create
        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> CreateProgress([FromBody] ProgressCreateDto request)
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

                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.UserName == username);

                if (doctor == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                // Verify that the doctor is recording under their own name
                if (request.RecordedByDoctorId != doctor.Id)
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "You can only record progress under your own name"
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

                // Verify diagnosis if provided
                if (request.DiagnosisId.HasValue)
                {
                    var diagnosis = await _db.Diagnoses.FindAsync(request.DiagnosisId.Value);
                    if (diagnosis == null)
                    {
                        return BadRequest(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Diagnosis not found"
                        });
                    }
                }

                // Verify treatment if provided
                if (request.TreatmentId.HasValue)
                {
                    var treatment = await _db.Treatments.FindAsync(request.TreatmentId.Value);
                    if (treatment == null)
                    {
                        return BadRequest(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Treatment not found"
                        });
                    }
                }

                var progress = new Progress
                {
                    Title = request.Title,
                    Notes = request.Notes,
                    DateRecorded = request.DateRecorded,
                    ProgressStatus = request.ProgressStatus,
                    Observations = request.Observations,
                    Recommendations = request.Recommendations,
                    ClientId = request.ClientId,
                    RecordedByDoctorId = request.RecordedByDoctorId,
                    DiagnosisId = request.DiagnosisId,
                    TreatmentId = request.TreatmentId
                };

                var createdProgress = await _progressRepository.CreateAsync(progress);
                var progressDto = MapToDto(createdProgress);

                return Ok(new ApiResponseDto<ProgressDto>
                {
                    Success = true,
                    Data = progressDto,
                    Message = "Progress entry created successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while creating progress entry",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // PUT: api/progress/{id} - Only Doctors can update
        [HttpPut("{id}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> UpdateProgress(int id, [FromBody] ProgressUpdateDto request)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.UserName == username);

                if (doctor == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                var progress = await _progressRepository.GetByIdAsync(id);
                if (progress == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Progress entry not found"
                    });
                }

                // Only the recording doctor can update
                if (progress.RecordedByDoctorId != doctor.Id)
                {
                    return Forbid();
                }

                // Update fields if provided
                if (request.Title != null) progress.Title = request.Title;
                if (request.Notes != null) progress.Notes = request.Notes;
                if (request.DateRecorded.HasValue) progress.DateRecorded = request.DateRecorded.Value;
                if (request.ProgressStatus != null) progress.ProgressStatus = request.ProgressStatus;
                if (request.Observations != null) progress.Observations = request.Observations;
                if (request.Recommendations != null) progress.Recommendations = request.Recommendations;
                if (request.DiagnosisId.HasValue) progress.DiagnosisId = request.DiagnosisId;
                if (request.TreatmentId.HasValue) progress.TreatmentId = request.TreatmentId;

                var updatedProgress = await _progressRepository.UpdateAsync(progress);
                var progressDto = MapToDto(updatedProgress);

                return Ok(new ApiResponseDto<ProgressDto>
                {
                    Success = true,
                    Data = progressDto,
                    Message = "Progress entry updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating progress entry",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // DELETE: api/progress/{id} - Only Doctors can delete
        [HttpDelete("{id}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> DeleteProgress(int id)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.UserName == username);

                if (doctor == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                var progress = await _progressRepository.GetByIdAsync(id);
                if (progress == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Progress entry not found"
                    });
                }

                // Only the recording doctor can delete
                if (progress.RecordedByDoctorId != doctor.Id)
                {
                    return Forbid();
                }

                await _progressRepository.DeleteAsync(id);

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Progress entry deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting progress entry",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/progress/doctor/{doctorId}
        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GetProgressByDoctor(int doctorId)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // If doctor is accessing, verify they can only see their own records
                if (role == "Doctor")
                {
                    var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.UserName == username);
                    if (doctor == null || doctor.Id != doctorId)
                    {
                        return Forbid();
                    }
                }

                var progressList = await _progressRepository.GetByDoctorIdAsync(doctorId);
                var progressDtos = progressList.Select(p => MapToDto(p)).ToList();

                return Ok(new ApiResponseDto<List<ProgressDto>>
                {
                    Success = true,
                    Data = progressDtos,
                    Message = "Doctor progress entries retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving doctor progress",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

       private ProgressDto MapToDto(Progress progress)
        {
            return new ProgressDto
            {
                Id = progress.Id,
                Title = progress.Title,
                Notes = progress.Notes,
                DateRecorded = progress.DateRecorded,
                ProgressStatus = progress.ProgressStatus,
                Observations = progress.Observations,
                Recommendations = progress.Recommendations,
                ClientId = progress.ClientId,
                RecordedByDoctorId = progress.RecordedByDoctorId,
                DiagnosisId = progress.DiagnosisId,
                TreatmentId = progress.TreatmentId,
                ClientName = progress.Client?.UserName ?? "Unknown Client",
                DoctorName = progress.RecordedByDoctor?.UserName ?? "Unknown Doctor",
                DiagnosisName = progress.Diagnosis?.Title ?? "No Diagnosis",  // Changed from ConditionName
                TreatmentName = progress.Treatment?.Title ?? "No Treatment"   // Changed from TreatmentName
            };
        }
    }
}