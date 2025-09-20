using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using FinalYearProject.Data;
using FinalYearProject.Models;

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
        private readonly IConfiguration _config;

        public AuthController(
            AppDbContext db,
            IPasswordHasher<Admin> adminHasher,
            IPasswordHasher<Client> clientHasher,
            IPasswordHasher<Doctor> doctorHasher,
            IConfiguration config)
        {
            _db = db;
            _adminHasher = adminHasher;
            _clientHasher = clientHasher;
            _doctorHasher = doctorHasher;
            _config = config;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            try
            {
                Console.WriteLine($"🔐 Login attempt for username: {request.UserName}");
                
                // Validate input
                if (string.IsNullOrEmpty(request.UserName) || string.IsNullOrEmpty(request.Password))
                {
                    Console.WriteLine("❌ Missing username or password");
                    return BadRequest(new { error = "Username and password are required" });
                }

                IUser? user = null;

                // Try Admin
                Console.WriteLine("🔍 Checking Admin table...");
                var admin = _db.Admins.FirstOrDefault(a => a.UserName == request.UserName);
                if (admin != null)
                {
                    Console.WriteLine($"👤 Found admin user: {admin.UserName}");
                    var result = _adminHasher.VerifyHashedPassword(admin, admin.PasswordHash, request.Password);
                    Console.WriteLine($"🔑 Admin password verification: {result}");
                    
                    if (result == PasswordVerificationResult.Success)
                    {
                        user = admin;
                        Console.WriteLine("✅ Admin login successful");
                    }
                }

                // Try Client
                if (user == null)
                {
                    Console.WriteLine("🔍 Checking Client table...");
                    var client = _db.Clients.FirstOrDefault(c => c.UserName == request.UserName);
                    if (client != null)
                    {
                        Console.WriteLine($"👤 Found client user: {client.UserName}");
                        var result = _clientHasher.VerifyHashedPassword(client, client.PasswordHash, request.Password);
                        Console.WriteLine($"🔑 Client password verification: {result}");
                        
                        if (result == PasswordVerificationResult.Success)
                        {
                            user = client;
                            Console.WriteLine("✅ Client login successful");
                        }
                    }
                }

                // Try Doctor
                if (user == null)
                {
                    Console.WriteLine("🔍 Checking Doctor table...");
                    var doctor = _db.Doctors.FirstOrDefault(d => d.UserName == request.UserName);
                    if (doctor != null)
                    {
                        Console.WriteLine($"👤 Found doctor user: {doctor.UserName}");
                        var result = _doctorHasher.VerifyHashedPassword(doctor, doctor.PasswordHash, request.Password);
                        Console.WriteLine($"🔑 Doctor password verification: {result}");
                        
                        if (result == PasswordVerificationResult.Success)
                        {
                            user = doctor;
                            Console.WriteLine("✅ Doctor login successful");
                        }
                    }
                }

                if (user == null)
                {
                    Console.WriteLine("❌ User not found or password mismatch");
                    
                    // Debug: Check if user exists at all
                    var adminExists = _db.Admins.Any(a => a.UserName == request.UserName);
                    var clientExists = _db.Clients.Any(c => c.UserName == request.UserName);
                    var doctorExists = _db.Doctors.Any(d => d.UserName == request.UserName);
                    
                    Console.WriteLine($"Debug - User exists in: Admin={adminExists}, Client={clientExists}, Doctor={doctorExists}");
                    
                    return Unauthorized(new { error = "Invalid username or password" });
                }

                Console.WriteLine($"🎫 Generating JWT token for user: {user.UserName}, Role: {user.Role}");
                
                var token = GenerateJwtToken(user);
                
                if (string.IsNullOrEmpty(token))
                {
                    Console.WriteLine("❌ Token generation failed");
                    return StatusCode(500, new { error = "Token generation failed" });
                }
                
                var response = new { 
                    Token = token, 
                    Role = user.Role,
                    UserName = user.UserName,
                    Success = true
                };
                
                Console.WriteLine($"✅ Login successful for {user.UserName}. Sending response: {System.Text.Json.JsonSerializer.Serialize(response)}");
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Login exception: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
            }
        }

        private string GenerateJwtToken(IUser user)
        {
            try
            {
                // Check JWT configuration
                var jwtKey = _config["Jwt:Key"];
                var jwtIssuer = _config["Jwt:Issuer"];
                var jwtAudience = _config["Jwt:Audience"];
                var jwtExpiryMinutes = _config["Jwt:ExpiryMinutes"];
                
                Console.WriteLine($"JWT Config - Key: {(string.IsNullOrEmpty(jwtKey) ? "MISSING" : "Present")}, Issuer: {jwtIssuer}, Audience: {jwtAudience}, Expiry: {jwtExpiryMinutes}");
                
                if (string.IsNullOrEmpty(jwtKey))
                {
                    throw new InvalidOperationException("JWT Key is not configured");
                }

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };

                var expiryMinutes = string.IsNullOrEmpty(jwtExpiryMinutes) ? 60 : Convert.ToDouble(jwtExpiryMinutes);

                var token = new JwtSecurityToken(
                    issuer: jwtIssuer,
                    audience: jwtAudience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                    signingCredentials: creds
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
                Console.WriteLine($"🎫 Generated token: {tokenString.Substring(0, Math.Min(50, tokenString.Length))}...");
                
                return tokenString;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ JWT generation error: {ex.Message}");
                throw;
            }
        }

        // Add a test endpoint to check if controller is working
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { 
                message = "Auth controller is working!", 
                timestamp = DateTime.Now,
                dbConnected = _db.Database.CanConnect()
            });
        }

        // Add endpoint to check users in database
        [HttpGet("debug/users")]
        public IActionResult DebugUsers()
        {
            try
            {
                var adminCount = _db.Admins.Count();
                var clientCount = _db.Clients.Count();
                var doctorCount = _db.Doctors.Count();
                
                var adminUsernames = _db.Admins.Take(5).Select(a => a.UserName).ToList();
                var clientUsernames = _db.Clients.Take(5).Select(c => c.UserName).ToList();
                var doctorUsernames = _db.Doctors.Take(5).Select(d => d.UserName).ToList();

                return Ok(new {
                    AdminCount = adminCount,
                    ClientCount = clientCount,
                    DoctorCount = doctorCount,
                    SampleAdminUsernames = adminUsernames,
                    SampleClientUsernames = clientUsernames,
                    SampleDoctorUsernames = doctorUsernames
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class LoginRequest
    {
        public string UserName { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}