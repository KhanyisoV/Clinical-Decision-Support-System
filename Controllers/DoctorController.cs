using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FinalYearProject.Data;
using FinalYearProject.Models;
using FinalYearProject.DTOs;
using Microsoft.AspNetCore.Identity;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<Doctor> _passwordHasher;

        public DoctorController(AppDbContext db, IPasswordHasher<Doctor> passwordHasher)
        {
            _db = db;
            _passwordHasher = passwordHasher;
        }

        // GET: api/doctor/profile/{username}
        [HttpGet("profile/{username}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetProfile(string username)
        {
            try
            {
                var doctor = await _db.Doctors
                    .FirstOrDefaultAsync(d => d.UserName == username);

                if (doctor == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                var doctorDto = new DoctorDto
                {
                    Id = doctor.Id,
                    UserName = doctor.UserName,
                    Role = doctor.Role,
                    FirstName = doctor.FirstName,
                    LastName = doctor.LastName,
                    Email = doctor.Email,
                    Specialization = doctor.Specialization,
                    LicenseNumber = doctor.LicenseNumber,
                    CreatedAt = doctor.CreatedAt,
                    UpdatedAt = doctor.UpdatedAt
                };

                return Ok(new ApiResponseDto<DoctorDto>
                {
                    Success = true,
                    Data = doctorDto,
                    Message = "Doctor profile retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while fetching profile",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/doctor/clients/{doctorUsername}
        [HttpGet("clients/{doctorUsername}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetAssignedClients(string doctorUsername)
        {
            try
            {
                // First, get the doctor to get their ID
                var doctor = await _db.Doctors
                    .FirstOrDefaultAsync(d => d.UserName == doctorUsername);

                if (doctor == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                // Get all clients assigned to this doctor
                var clients = await _db.Clients
                    .Where(c => c.AssignedDoctorId == doctor.Id)
                    .Select(c => new ClientDto
                    {
                        Id = c.Id,  // ← ADD THIS LINE
                        UserName = c.UserName,
                        Role = c.Role,
                        FirstName = c.FirstName,
                        LastName = c.LastName,
                        Email = c.Email,
                        DateOfBirth = c.DateOfBirth,
                        AssignedDoctor = new DoctorBasicDto
                        {
                            Id = doctor.Id,
                            UserName = doctor.UserName,
                            FirstName = doctor.FirstName,
                            LastName = doctor.LastName,
                            Specialization = doctor.Specialization
                        },
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(new ApiResponseDto<List<ClientDto>>
                {
                    Success = true,
                    Data = clients,
                    Message = $"Retrieved {clients.Count} assigned clients"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while fetching assigned clients",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // PUT: api/doctor/profile/{username}
        [HttpPut("profile/{username}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> UpdateProfile(string username, [FromBody] DoctorUpdateDto updateDto)
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
                if (!string.IsNullOrEmpty(updateDto.FirstName))
                    doctor.FirstName = updateDto.FirstName;

                if (!string.IsNullOrEmpty(updateDto.LastName))
                    doctor.LastName = updateDto.LastName;

                if (!string.IsNullOrEmpty(updateDto.Email))
                    doctor.Email = updateDto.Email;

                if (!string.IsNullOrEmpty(updateDto.Specialization))
                    doctor.Specialization = updateDto.Specialization;

                if (!string.IsNullOrEmpty(updateDto.LicenseNumber))
                    doctor.LicenseNumber = updateDto.LicenseNumber;

                if (!string.IsNullOrEmpty(updateDto.Password))
                {
                    doctor.PasswordHash = _passwordHasher.HashPassword(doctor, updateDto.Password);
                }

                doctor.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Profile updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating profile",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // POST: api/doctor/register (if you need it)
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
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
                    CreatedAt = DateTime.UtcNow
                };
                
                doctor.PasswordHash = _passwordHasher.HashPassword(doctor, request.Password);

                _db.Doctors.Add(doctor);
                await _db.SaveChangesAsync();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Doctor registered successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred during registration",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}