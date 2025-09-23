using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FinalYearProject.Data;
using FinalYearProject.Models;
using FinalYearProject.DTOs;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<Admin> _adminHasher;
        private readonly IPasswordHasher<Client> _clientHasher;
        private readonly IPasswordHasher<Doctor> _doctorHasher;
        private readonly IConfiguration _configuration;

        public AuthController(
            AppDbContext db,
            IPasswordHasher<Admin> adminHasher,
            IPasswordHasher<Client> clientHasher,
            IPasswordHasher<Doctor> doctorHasher,
            IConfiguration configuration)
        {
            _db = db;
            _adminHasher = adminHasher;
            _clientHasher = clientHasher;
            _doctorHasher = doctorHasher;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
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

                // Check if user is an Admin
                var admin = await _db.Admins.FirstOrDefaultAsync(a => a.UserName == loginDto.UserName);
                if (admin != null)
                {
                    var adminResult = _adminHasher.VerifyHashedPassword(admin, admin.PasswordHash, loginDto.Password);
                    if (adminResult == PasswordVerificationResult.Success)
                    {
                        var token = GenerateJwtToken(admin.UserName, "Admin");
                        return Ok(new ApiResponseDto<LoginResponseDto>
                        {
                            Success = true,
                            Data = new LoginResponseDto
                            {
                                Token = token,
                                Role = "Admin",
                                UserName = admin.UserName,
                                Success = true
                            },
                            Message = "Login successful"
                        });
                    }
                }

                // Check if user is a Doctor
                var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.UserName == loginDto.UserName);
                if (doctor != null)
                {
                    var doctorResult = _doctorHasher.VerifyHashedPassword(doctor, doctor.PasswordHash, loginDto.Password);
                    if (doctorResult == PasswordVerificationResult.Success)
                    {
                        var token = GenerateJwtToken(doctor.UserName, "Doctor");
                        return Ok(new ApiResponseDto<LoginResponseDto>
                        {
                            Success = true,
                            Data = new LoginResponseDto
                            {
                                Token = token,
                                Role = "Doctor",
                                UserName = doctor.UserName,
                                Success = true
                            },
                            Message = "Login successful"
                        });
                    }
                }

                // Check if user is a Client
                var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == loginDto.UserName);
                if (client != null)
                {
                    var clientResult = _clientHasher.VerifyHashedPassword(client, client.PasswordHash, loginDto.Password);
                    if (clientResult == PasswordVerificationResult.Success)
                    {
                        var token = GenerateJwtToken(client.UserName, "Client");
                        return Ok(new ApiResponseDto<LoginResponseDto>
                        {
                            Success = true,
                            Data = new LoginResponseDto
                            {
                                Token = token,
                                Role = "Client",
                                UserName = client.UserName,
                                Success = true
                            },
                            Message = "Login successful"
                        });
                    }
                }

                return Unauthorized(new ApiResponseDto
                {
                    Success = false,
                    Message = "Invalid username or password"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred during login",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
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

                // Check if username already exists in any table
                var usernameExists = await _db.Admins.AnyAsync(a => a.UserName == request.UserName) ||
                                   await _db.Doctors.AnyAsync(d => d.UserName == request.UserName) ||
                                   await _db.Clients.AnyAsync(c => c.UserName == request.UserName);

                if (usernameExists)
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Username already exists"
                    });
                }

                // For now, default to creating a client
                var client = new Client
                {
                    UserName = request.UserName,
                    Role = "Client",
                    CreatedAt = DateTime.UtcNow
                };

                client.PasswordHash = _clientHasher.HashPassword(client, request.Password);

                _db.Clients.Add(client);
                await _db.SaveChangesAsync();

                var token = GenerateJwtToken(client.UserName, "Client");

                return Ok(new ApiResponseDto<LoginResponseDto>
                {
                    Success = true,
                    Data = new LoginResponseDto
                    {
                        Token = token,
                        Role = "Client",
                        UserName = client.UserName,
                        Success = true
                    },
                    Message = "Registration successful"
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

        private string GenerateJwtToken(string username, string role)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role),
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(Convert.ToDouble(jwtSettings["ExpiryInHours"])),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}