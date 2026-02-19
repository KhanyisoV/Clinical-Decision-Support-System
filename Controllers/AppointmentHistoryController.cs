using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Repositories;
using FinalYearProject.DTOs;
using System.Security.Claims;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AppointmentHistoryController : ControllerBase
    {
        private readonly IAppointmentHistoryRepository _historyRepo;
        private readonly IAppointmentRepository _appointmentRepo;
        private readonly IClientRepository _clientRepo;
        private readonly IDoctorRepository _doctorRepo;

        public AppointmentHistoryController(
            IAppointmentHistoryRepository historyRepo,
            IAppointmentRepository appointmentRepo,
            IClientRepository clientRepo,
            IDoctorRepository doctorRepo)
        {
            _historyRepo = historyRepo;
            _appointmentRepo = appointmentRepo;
            _clientRepo = clientRepo;
            _doctorRepo = doctorRepo;
        }

        // GET: api/appointmenthistory
        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Client")]
        public IActionResult GetAllHistory()
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                IEnumerable<Models.AppointmentHistory> histories;

                if (role == "Client")
                {
                    // Clients can only see history of their own appointments
                    var client = _clientRepo.GetByUserName(username!);
                    if (client == null)
                    {
                        return NotFound(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Client not found"
                        });
                    }
                    histories = _historyRepo.GetByClientId(client.Id);
                }
                else if (role == "Doctor")
                {
                    // Doctors can see history of their appointments
                    var doctor = _doctorRepo.GetByUserName(username!);
                    if (doctor == null)
                    {
                        return NotFound(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Doctor not found"
                        });
                    }
                    histories = _historyRepo.GetByDoctorId(doctor.Id);
                }
                else
                {
                    // Admins can see all history
                    histories = _historyRepo.GetAll();
                }

                var historyDtos = histories.Select(h => MapToDto(h)).ToList();

                return Ok(new ApiResponseDto<List<AppointmentHistoryDto>>
                {
                    Success = true,
                    Data = historyDtos,
                    Message = "Appointment history retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving appointment history",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/appointmenthistory/appointment/{appointmentId}
        [HttpGet("appointment/{appointmentId}")]
        [Authorize(Roles = "Admin,Doctor,Client")]
        public IActionResult GetHistoryByAppointment(int appointmentId)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                var appointment = _appointmentRepo.GetById(appointmentId);
                if (appointment == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Appointment not found"
                    });
                }

                // Authorization check
                if (role == "Client")
                {
                    var client = _clientRepo.GetByUserName(username!);
                    if (client == null || appointment.ClientId != client.Id)
                    {
                        return Forbid();
                    }
                }
                else if (role == "Doctor")
                {
                    var doctor = _doctorRepo.GetByUserName(username!);
                    if (doctor == null || appointment.DoctorId != doctor.Id)
                    {
                        return Forbid();
                    }
                }

                var histories = _historyRepo.GetByAppointmentId(appointmentId);
                var historyDtos = histories.Select(h => MapToDto(h)).ToList();

                // Include appointment details
                var appointmentDto = new AppointmentDto
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

                var result = new AppointmentWithHistoryDto
                {
                    Appointment = appointmentDto,
                    History = historyDtos
                };

                return Ok(new ApiResponseDto<AppointmentWithHistoryDto>
                {
                    Success = true,
                    Data = result,
                    Message = "Appointment history retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving appointment history",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/appointmenthistory/status/{status}
        [HttpGet("status/{status}")]
        [Authorize(Roles = "Admin,Doctor")]
        public IActionResult GetHistoryByStatus(string status)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                IEnumerable<Models.AppointmentHistory> histories;

                if (role == "Doctor")
                {
                    var doctor = _doctorRepo.GetByUserName(username!);
                    if (doctor == null)
                    {
                        return NotFound(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Doctor not found"
                        });
                    }
                    histories = _historyRepo.GetByDoctorId(doctor.Id)
                        .Where(h => h.NewStatus == status);
                }
                else
                {
                    histories = _historyRepo.GetByStatus(status);
                }

                var historyDtos = histories.Select(h => MapToDto(h)).ToList();

                return Ok(new ApiResponseDto<List<AppointmentHistoryDto>>
                {
                    Success = true,
                    Data = historyDtos,
                    Message = $"Appointment history with status '{status}' retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving appointment history",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/appointmenthistory/daterange
        [HttpGet("daterange")]
        [Authorize(Roles = "Admin,Doctor")]
        public IActionResult GetHistoryByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
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

                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                IEnumerable<Models.AppointmentHistory> histories;

                if (role == "Doctor")
                {
                    var doctor = _doctorRepo.GetByUserName(username!);
                    if (doctor == null)
                    {
                        return NotFound(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Doctor not found"
                        });
                    }
                    histories = _historyRepo.GetByDoctorId(doctor.Id)
                        .Where(h => h.ChangedAt >= startDate && h.ChangedAt <= endDate);
                }
                else
                {
                    histories = _historyRepo.GetByDateRange(startDate, endDate);
                }

                var historyDtos = histories.Select(h => MapToDto(h)).ToList();

                return Ok(new ApiResponseDto<List<AppointmentHistoryDto>>
                {
                    Success = true,
                    Data = historyDtos,
                    Message = "Appointment history in date range retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving appointment history",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Helper method to map entity to DTO
        private AppointmentHistoryDto MapToDto(Models.AppointmentHistory history)
        {
            return new AppointmentHistoryDto
            {
                Id = history.Id,
                AppointmentId = history.AppointmentId,
                AppointmentTitle = history.Appointment.Title,
                AppointmentDate = history.Appointment.AppointmentDate,
                PreviousStatus = history.PreviousStatus,
                NewStatus = history.NewStatus,
                ChangeReason = history.ChangeReason,
                Notes = history.Notes,
                ChangedBy = history.ChangedBy,
                ChangedByRole = history.ChangedByRole,
                ChangedAt = history.ChangedAt,
                Client = new ClientBasicDto
                {
                    UserName = history.Appointment.Client.UserName,
                    FirstName = history.Appointment.Client.FirstName,
                    LastName = history.Appointment.Client.LastName
                },
                Doctor = new DoctorBasicDto
                {
                    UserName = history.Appointment.Doctor.UserName,
                    FirstName = history.Appointment.Doctor.FirstName,
                    LastName = history.Appointment.Doctor.LastName,
                    Specialization = history.Appointment.Doctor.Specialization
                }
            };
        }
    }
}