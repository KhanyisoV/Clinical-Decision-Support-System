using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Data;
using FinalYearProject.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using FinalYearProject.DTOs;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<Admin> _adminHasher;
        private readonly IPasswordHasher<Client> _clientHasher;
        private readonly IPasswordHasher<Doctor> _doctorHasher;

        public AdminController(
            AppDbContext db, 
            IPasswordHasher<Admin> adminHasher,
            IPasswordHasher<Client> clientHasher,
            IPasswordHasher<Doctor> doctorHasher)
        {
            _db = db;
            _adminHasher = adminHasher;
            _clientHasher = clientHasher;
            _doctorHasher = doctorHasher;
        }

        // Admin Management
        [HttpGet]
        public async Task<IActionResult> GetAdmins()
        {
            try
            {
                var admins = await _db.Admins
                    .Select(a => new AdminDto
                    {
                        UserName = a.UserName,
                        Role = a.Role,
                        FirstName = a.FirstName,
                        LastName = a.LastName,
                        Email = a.Email,
                        CreatedAt = a.CreatedAt,
                        UpdatedAt = a.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(new ApiResponseDto<List<AdminDto>>
                {
                    Success = true,
                    Data = admins,
                    Message = "Admins retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving admins",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateAdmin([FromBody] AdminCreateDto request)
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

                if (await _db.Admins.AnyAsync(a => a.UserName == request.UserName))
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Username already exists"
                    });
                }

                var admin = new Admin
                {
                    UserName = request.UserName,
                    Role = "Admin",
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    CreatedAt = DateTime.UtcNow
                };

                admin.PasswordHash = _adminHasher.HashPassword(admin, request.Password);

                _db.Admins.Add(admin);
                await _db.SaveChangesAsync();

                var adminDto = new AdminDto
                {
                    UserName = admin.UserName,
                    Role = admin.Role,
                    FirstName = admin.FirstName,
                    LastName = admin.LastName,
                    Email = admin.Email,
                    CreatedAt = admin.CreatedAt
                };

                return Ok(new ApiResponseDto<AdminDto>
                {
                    Success = true,
                    Data = adminDto,
                    Message = "Admin created successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while creating admin",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Add this method to your AdminController to include appointment statistics

        [HttpGet("dashboard/stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var thisWeek = today.AddDays(-7);
                var thisMonth = today.AddDays(-30);

                var stats = new
                {
                    TotalClients = await _db.Clients.CountAsync(),
                    TotalDoctors = await _db.Doctors.CountAsync(),
                    TotalAdmins = await _db.Admins.CountAsync(),
                    ActiveDiagnoses = await _db.Diagnoses.CountAsync(d => d.IsActive),
                    RecentRegistrations = await _db.Clients
                        .Where(c => c.CreatedAt >= thisMonth)
                        .CountAsync(),
                    
                    // Appointment Statistics
                    TotalAppointments = await _db.Appointments.CountAsync(),
                    UpcomingAppointments = await _db.Appointments
                        .CountAsync(a => a.AppointmentDate >= today && a.Status == "Scheduled"),
                    TodaysAppointments = await _db.Appointments
                        .CountAsync(a => a.AppointmentDate.Date == today && a.Status == "Scheduled"),
                    CompletedAppointmentsThisWeek = await _db.Appointments
                        .CountAsync(a => a.AppointmentDate >= thisWeek && a.Status == "Completed"),
                    CancelledAppointmentsThisMonth = await _db.Appointments
                        .CountAsync(a => a.AppointmentDate >= thisMonth && a.Status == "Cancelled"),
                    
                    // Recent Appointments
                    RecentAppointments = await _db.Appointments
                        .Include(a => a.Client)
                        .Include(a => a.Doctor)
                        .Where(a => a.AppointmentDate >= today)
                        .OrderBy(a => a.AppointmentDate)
                        .ThenBy(a => a.StartTime)
                        .Take(5)
                        .Select(a => new
                        {
                            a.Id,
                            a.Title,
                            a.AppointmentDate,
                            a.StartTime,
                            a.Status,
                            ClientName = $"{a.Client.FirstName} {a.Client.LastName}",
                            DoctorName = $"{a.Doctor.FirstName} {a.Doctor.LastName}"
                        })
                        .ToListAsync()
                };

                return Ok(new ApiResponseDto<object>
                {
                    Success = true,
                    Data = stats,
                    Message = "Dashboard statistics retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving dashboard statistics",
                    Errors = new List<string> { ex.Message }
                });
            }
        }


        // Client Management
        [HttpGet("clients")]
        public async Task<IActionResult> GetAllClients()
        {
            try
            {
                var clients = await _db.Clients
                    .Include(c => c.AssignedDoctor)
                    .Select(c => new ClientDto
                    {
                        UserName = c.UserName,
                        Role = c.Role,
                        FirstName = c.FirstName,
                        LastName = c.LastName,
                        Email = c.Email,
                        DateOfBirth = c.DateOfBirth,
                        AssignedDoctor = c.AssignedDoctor != null ? new DoctorBasicDto
                        {
                            UserName = c.AssignedDoctor.UserName,
                            FirstName = c.AssignedDoctor.FirstName,
                            LastName = c.AssignedDoctor.LastName,
                            Specialization = c.AssignedDoctor.Specialization
                        } : null,
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(new ApiResponseDto<List<ClientDto>>
                {
                    Success = true,
                    Data = clients,
                    Message = "Clients retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving clients",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPost("clients")]
        public async Task<IActionResult> CreateClient([FromBody] ClientCreateDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList();
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Invalid data provided",
                        Errors = errors
                    });
                }

                if (await _db.Clients.AnyAsync(c => c.UserName == request.UserName))
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Username already exists"
                    });
                }

                // Validate password
                if(string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new ApiResponseDto 
                    {
                        Success = false,
                        Message = "Password is required"
                    });
                }

                // Validate doctor assignment if provided
                Doctor? assignedDoctor = null;
                int? doctorId = null;
                
                if (request.AssignedDoctorId.HasValue && request.AssignedDoctorId.Value > 0)
                {
                    assignedDoctor = await _db.Doctors.FindAsync(request.AssignedDoctorId.Value);
                    if (assignedDoctor == null)
                    {
                        return BadRequest(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Assigned doctor not found"
                        });
                    }
                    doctorId = request.AssignedDoctorId.Value;
                }

                var client = new Client
                {
                    UserName = request.UserName.Trim(),
                    Role = "Client",
                    FirstName = request.FirstName?.Trim(),
                    LastName = request.LastName?.Trim(),
                    Email = request.Email?.Trim(),
                    DateOfBirth = request.DateOfBirth,
                    AssignedDoctorId = doctorId,
                    CreatedAt = DateTime.UtcNow
                };

                // Hash Password
                client.PasswordHash = _clientHasher.HashPassword(client, request.Password);

                _db.Clients.Add(client);
                await _db.SaveChangesAsync();

                // Reload the client with doctor info
                var createdClient = await _db.Clients
                    .Include(c => c.AssignedDoctor)
                    .FirstOrDefaultAsync(c => c.UserName == client.UserName);

                var clientDto = new ClientDto
                {
                    UserName = createdClient.UserName,
                    Role = createdClient.Role,
                    FirstName = createdClient.FirstName,
                    LastName = createdClient.LastName,
                    Email = createdClient.Email,
                    DateOfBirth = createdClient.DateOfBirth,
                    AssignedDoctor = createdClient.AssignedDoctor != null ? new DoctorBasicDto
                    {
                        UserName = createdClient.AssignedDoctor.UserName,
                        FirstName = createdClient.AssignedDoctor.FirstName,
                        LastName = createdClient.AssignedDoctor.LastName,
                        Specialization = createdClient.AssignedDoctor.Specialization
                    } : null,
                    CreatedAt = createdClient.CreatedAt
                };

                return Ok(new ApiResponseDto<ClientDto>
                {
                    Success = true,
                    Data = clientDto,
                    Message = "Client created successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating client: {ex}");
                
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while creating client",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPut("clients/{username}")]
        public async Task<IActionResult> UpdateClient(string username, [FromBody] ClientUpdateDto request)
        {
            try
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

                // Update fields if provided
                if (!string.IsNullOrEmpty(request.UserName) && request.UserName != client.UserName)
                {
                    if (await _db.Clients.AnyAsync(c => c.UserName == request.UserName))
                    {
                        return BadRequest(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Username already exists"
                        });
                    }
                    client.UserName = request.UserName;
                }

                if (!string.IsNullOrEmpty(request.Password))
                {
                    client.PasswordHash = _clientHasher.HashPassword(client, request.Password);
                }

                if (request.FirstName != null) client.FirstName = request.FirstName;
                if (request.LastName != null) client.LastName = request.LastName;
                if (request.Email != null) client.Email = request.Email;
                if (request.DateOfBirth.HasValue) client.DateOfBirth = request.DateOfBirth;
                if (request.AssignedDoctorId.HasValue) client.AssignedDoctorId = request.AssignedDoctorId;

                client.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Client updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating client",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpDelete("clients/{username}")]
        public async Task<IActionResult> DeleteClient(string username)
        {
            try
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

                _db.Clients.Remove(client);
                await _db.SaveChangesAsync();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Client deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting client",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Doctor Management
        [HttpGet("doctors")]
        public async Task<IActionResult> GetAllDoctors()
        {
            try
            {
                var doctors = await _db.Doctors
                    .Select(d => new DoctorDto
                    {
                        Id = d.Id, // ADD THIS LINE
                        UserName = d.UserName,
                        Role = d.Role,
                        FirstName = d.FirstName,
                        LastName = d.LastName,
                        Email = d.Email,
                        Specialization = d.Specialization,
                        LicenseNumber = d.LicenseNumber,
                        CreatedAt = d.CreatedAt,
                        UpdatedAt = d.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(new ApiResponseDto<List<DoctorDto>>
                {
                    Success = true,
                    Data = doctors,
                    Message = "Doctors retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving doctors",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
        [HttpPost("doctors")]
        public async Task<IActionResult> CreateDoctor([FromBody] DoctorCreateDto request)
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

                if (await _db.Doctors.AnyAsync(d => d.UserName == request.UserName))
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Username already exists"
                    });
                }

                var doctor = new Doctor
                {
                    UserName = request.UserName,
                    Role = "Doctor",
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    Specialization = request.Specialization,
                    LicenseNumber = request.LicenseNumber,
                    CreatedAt = DateTime.UtcNow
                };

                doctor.PasswordHash = _doctorHasher.HashPassword(doctor, request.Password);

                _db.Doctors.Add(doctor);
                await _db.SaveChangesAsync();

                var doctorDto = new DoctorDto
                {
                    UserName = doctor.UserName,
                    Role = doctor.Role,
                    FirstName = doctor.FirstName,
                    LastName = doctor.LastName,
                    Email = doctor.Email,
                    Specialization = doctor.Specialization,
                    LicenseNumber = doctor.LicenseNumber,
                    CreatedAt = doctor.CreatedAt
                };

                return Ok(new ApiResponseDto<DoctorDto>
                {
                    Success = true,
                    Data = doctorDto,
                    Message = "Doctor created successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while creating doctor",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPut("doctors/{username}")]
        public async Task<IActionResult> UpdateDoctor(string username, [FromBody] DoctorUpdateDto request)
        {
            try
            {
                var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.UserName == username);
                if (doctor == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                // Update fields if provided
                if (!string.IsNullOrEmpty(request.UserName) && request.UserName != doctor.UserName)
                {
                    if (await _db.Doctors.AnyAsync(d => d.UserName == request.UserName))
                    {
                        return BadRequest(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Username already exists"
                        });
                    }
                    doctor.UserName = request.UserName;
                }

                if (!string.IsNullOrEmpty(request.Password))
                {
                    doctor.PasswordHash = _doctorHasher.HashPassword(doctor, request.Password);
                }

                if (request.FirstName != null) doctor.FirstName = request.FirstName;
                if (request.LastName != null) doctor.LastName = request.LastName;
                if (request.Email != null) doctor.Email = request.Email;
                if (request.Specialization != null) doctor.Specialization = request.Specialization;
                if (request.LicenseNumber != null) doctor.LicenseNumber = request.LicenseNumber;

                doctor.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Doctor updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating doctor",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpDelete("doctors/{username}")]
        public async Task<IActionResult> DeleteDoctor(string username)
        {
            try
            {
                var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.UserName == username);
                if (doctor == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                _db.Doctors.Remove(doctor);
                await _db.SaveChangesAsync();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Doctor deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting doctor",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        
    }
}