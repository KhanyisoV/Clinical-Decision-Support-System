using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Repositories;
using FinalYearProject.Models;
using FinalYearProject.DTOs;
using System.Security.Claims;
using FinalYearProject.Services;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentRepository _appointmentRepo;
        private readonly IAppointmentHistoryRepository _historyRepo;
        private readonly IClientRepository _clientRepo;
        private readonly IDoctorRepository _doctorRepo;
       

        public AppointmentController(
            IAppointmentRepository appointmentRepo,
            IAppointmentHistoryRepository historyRepo,
            IClientRepository clientRepo,
            IDoctorRepository doctorRepo)
        {
            _appointmentRepo = appointmentRepo;
            _historyRepo = historyRepo;
            _clientRepo = clientRepo;
            _doctorRepo = doctorRepo;
            
        }

        // GET: api/appointment
        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Client")]
        public IActionResult GetAppointments()
        {
            try
            {
                var appointments = _appointmentRepo.GetAll();
                var appointmentDtos = appointments.Select(a => MapToDto(a)).ToList();

                return Ok(new ApiResponseDto<List<AppointmentDto>>
                {
                    Success = true,
                    Data = appointmentDtos,
                    Message = "Appointments retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving appointments",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/appointment/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Client")]
        public IActionResult GetAppointment(int id)
        {
            try
            {
                var appointment = _appointmentRepo.GetById(id);
                if (appointment == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Appointment not found"
                    });
                }

                var appointmentDto = MapToDto(appointment);

                return Ok(new ApiResponseDto<AppointmentDto>
                {
                    Success = true,
                    Data = appointmentDto,
                    Message = "Appointment retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving appointment",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // POST: api/appointment
        [HttpPost]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> CreateAppointment([FromBody] AppointmentCreateDto request)
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

                var client = _clientRepo.GetById(request.ClientId);
                if (client == null)
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Client not found"
                    });
                }

                var doctor = _doctorRepo.GetById(request.DoctorId);
                if (doctor == null)
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                if (request.EndTime <= request.StartTime)
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "End time must be after start time"
                    });
                }

                if (_appointmentRepo.HasConflict(request.DoctorId, request.AppointmentDate, request.StartTime, request.EndTime))
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "This appointment time conflicts with an existing appointment for the doctor"
                    });
                }

                var appointment = new Appointment
                {
                    Title = request.Title,
                    Description = request.Description,
                    AppointmentDate = request.AppointmentDate,
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    Status = request.Status,
                    Location = request.Location,
                    Notes = request.Notes,
                    ClientId = request.ClientId,
                    DoctorId = request.DoctorId,
                    CreatedAt = DateTime.UtcNow
                };

                _appointmentRepo.Add(appointment);
                _appointmentRepo.Save();

                // Log initial status in history
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                var history = new AppointmentHistory
                {
                    AppointmentId = appointment.Id,
                    PreviousStatus = "None",
                    NewStatus = appointment.Status,
                    ChangeReason = "Appointment created",
                    ChangedBy = username ?? "System",
                    ChangedByRole = role ?? "Unknown",
                    ChangedAt = DateTime.UtcNow
                };

                _historyRepo.Add(history);
                _historyRepo.Save();

                // Reload to get navigation properties
                appointment = _appointmentRepo.GetById(appointment.Id);

                var appointmentDto = MapToDto(appointment!);

                return Ok(new ApiResponseDto<AppointmentDto>
                {
                    Success = true,
                    Data = appointmentDto,
                    Message = "Appointment updated successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while creating appointment",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // PUT: api/appointment/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] AppointmentUpdateDto request)
        {
            try
            {
                var appointment = _appointmentRepo.GetById(id);
                if (appointment == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Appointment not found"
                    });
                }

                var oldStatus = appointment.Status;
                var oldDate = appointment.AppointmentDate;
                var oldTime = appointment.StartTime;
                var oldLocation = appointment.Location;

                if (request.Title != null) appointment.Title = request.Title;
                if (request.Description != null) appointment.Description = request.Description;
                if (request.AppointmentDate.HasValue) appointment.AppointmentDate = request.AppointmentDate.Value;
                if (request.StartTime.HasValue) appointment.StartTime = request.StartTime.Value;
                if (request.EndTime.HasValue) appointment.EndTime = request.EndTime.Value;
                if (request.Status != null) appointment.Status = request.Status;
                if (request.Location != null) appointment.Location = request.Location;
                if (request.Notes != null) appointment.Notes = request.Notes;

                if (request.ClientId.HasValue)
                {
                    var client = _clientRepo.GetById(request.ClientId.Value);
                    if (client == null)
                    {
                        return BadRequest(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Client not found"
                        });
                    }
                    appointment.ClientId = request.ClientId.Value;
                }

                if (request.DoctorId.HasValue)
                {
                    var doctor = _doctorRepo.GetById(request.DoctorId.Value);
                    if (doctor == null)
                    {
                        return BadRequest(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Doctor not found"
                        });
                    }
                    appointment.DoctorId = request.DoctorId.Value;
                }

                if (appointment.EndTime <= appointment.StartTime)
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "End time must be after start time"
                    });
                }

                if (_appointmentRepo.HasConflict(appointment.DoctorId, appointment.AppointmentDate, 
                    appointment.StartTime, appointment.EndTime, id))
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "This appointment time conflicts with an existing appointment for the doctor"
                    });
                }

                appointment.UpdatedAt = DateTime.UtcNow;
                _appointmentRepo.Update(appointment);
                _appointmentRepo.Save();

                // Log status change if status was updated
                if (oldStatus != appointment.Status)
                {
                    var username = User.FindFirst(ClaimTypes.Name)?.Value;
                    var role = User.FindFirst(ClaimTypes.Role)?.Value;

                    var history = new AppointmentHistory
                    {
                        AppointmentId = appointment.Id,
                        PreviousStatus = oldStatus,
                        NewStatus = appointment.Status,
                        ChangeReason = "Appointment updated",
                        ChangedBy = username ?? "System",
                        ChangedByRole = role ?? "Unknown",
                        ChangedAt = DateTime.UtcNow
                    };

                    _historyRepo.Add(history);
                    _historyRepo.Save();
                }

            
                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Appointment updated successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating appointment",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // PATCH: api/appointment/{id}/cancel
        [HttpPatch("{id}/cancel")]
        [Authorize(Roles = "Admin,Doctor")]
        public IActionResult CancelAppointment(int id, [FromBody] string? cancellationReason = null)
        {
            try
            {
                var appointment = _appointmentRepo.GetById(id);
                if (appointment == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Appointment not found"
                    });
                }

                var oldStatus = appointment.Status;
                appointment.Status = "Cancelled";
                
                if (!string.IsNullOrEmpty(cancellationReason))
                {
                    appointment.Notes = string.IsNullOrEmpty(appointment.Notes) 
                        ? $"Cancellation reason: {cancellationReason}"
                        : $"{appointment.Notes}\nCancellation reason: {cancellationReason}";
                }
                
                appointment.UpdatedAt = DateTime.UtcNow;
                _appointmentRepo.Update(appointment);
                _appointmentRepo.Save();

                // Log status change
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                var history = new AppointmentHistory
                {
                    AppointmentId = appointment.Id,
                    PreviousStatus = oldStatus,
                    NewStatus = "Cancelled",
                    ChangeReason = cancellationReason ?? "Appointment cancelled",
                    ChangedBy = username ?? "System",
                    ChangedByRole = role ?? "Unknown",
                    ChangedAt = DateTime.UtcNow
                };

                _historyRepo.Add(history);
                _historyRepo.Save();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Appointment cancelled successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while cancelling appointment",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // PATCH: api/appointment/{id}/complete
        [HttpPatch("{id}/complete")]
        [Authorize(Roles = "Admin,Doctor")]
        public IActionResult CompleteAppointment(int id)
        {
            try
            {
                var appointment = _appointmentRepo.GetById(id);
                if (appointment == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Appointment not found"
                    });
                }

                var oldStatus = appointment.Status;
                appointment.Status = "Completed";
                appointment.UpdatedAt = DateTime.UtcNow;
                _appointmentRepo.Update(appointment);
                _appointmentRepo.Save();

                // Log status change
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                var history = new AppointmentHistory
                {
                    AppointmentId = appointment.Id,
                    PreviousStatus = oldStatus,
                    NewStatus = "Completed",
                    ChangeReason = "Appointment completed",
                    ChangedBy = username ?? "System",
                    ChangedByRole = role ?? "Unknown",
                    ChangedAt = DateTime.UtcNow
                };

                _historyRepo.Add(history);
                _historyRepo.Save();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Appointment marked as completed"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while completing appointment",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // DELETE: api/appointment/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public IActionResult DeleteAppointment(int id)
        {
            try
            {
                var appointment = _appointmentRepo.GetById(id);
                if (appointment == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Appointment not found"
                    });
                }

                _appointmentRepo.Delete(appointment);
                _appointmentRepo.Save();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Appointment deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting appointment",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Helper method to map entity to DTO
        private AppointmentDto MapToDto(Appointment appointment)
        {
            return new AppointmentDto
            {
                Id = appointment.Id,
                Title = appointment.Title,
                Description = appointment.Description,
                AppointmentDate = appointment.AppointmentDate,
                StartTime = appointment.StartTime,
                EndTime = appointment.EndTime,
                Status = appointment.Status,
                Location = appointment.Location,
                Notes = appointment.Notes,
                Client = new ClientBasicDto
                {
                    UserName = appointment.Client.UserName,
                    FirstName = appointment.Client.FirstName,
                    LastName = appointment.Client.LastName
                },
                Doctor = new DoctorBasicDto
                {
                    UserName = appointment.Doctor.UserName,
                    FirstName = appointment.Doctor.FirstName,
                    LastName = appointment.Doctor.LastName,
                    Specialization = appointment.Doctor.Specialization
                },
                CreatedAt = appointment.CreatedAt,
                UpdatedAt = appointment.UpdatedAt
            };
        }
    }
}