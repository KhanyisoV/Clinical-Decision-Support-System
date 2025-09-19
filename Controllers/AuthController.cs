// Controllers/AuthController.cs
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
            IUser? user = null;

            // Try Admin
            var admin = _db.Admins.FirstOrDefault(a => a.UserName == request.UserName);
            if (admin != null &&
                _adminHasher.VerifyHashedPassword(admin, admin.PasswordHash, request.Password)
                == PasswordVerificationResult.Success)
            {
                user = admin;
            }

            // Try Client
            if (user == null)
            {
                var client = _db.Clients.FirstOrDefault(c => c.UserName == request.UserName);
                if (client != null &&
                    _clientHasher.VerifyHashedPassword(client, client.PasswordHash, request.Password)
                    == PasswordVerificationResult.Success)
                {
                    user = client;
                }
            }

            // Try Doctor
            if (user == null)
            {
                var doctor = _db.Doctors.FirstOrDefault(d => d.UserName == request.UserName);
                if (doctor != null &&
                    _doctorHasher.VerifyHashedPassword(doctor, doctor.PasswordHash, request.Password)
                    == PasswordVerificationResult.Success)
                {
                    user = doctor;
                }
            }

            if (user == null)
                return Unauthorized("Invalid username or password.");

            var token = GenerateJwtToken(user);
            return Ok(new { Token = token, Role = user.Role });
        }

        private string GenerateJwtToken(IUser user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(_config["Jwt:ExpiryMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string UserName { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}