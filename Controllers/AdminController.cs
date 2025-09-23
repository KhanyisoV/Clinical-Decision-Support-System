using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Data;
using FinalYearProject.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using FinalYearProject.DTOs;
using FinalYearProject.Services;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<Admin> _hasher;

        public AdminController(AppDbContext db, IPasswordHasher<Admin> hasher)
        {
            _db = db;
            _hasher = hasher;
        }

        [HttpGet]
        public IActionResult GetAdmins()
        {
            var admins = _db.Admins.ToList();
            return Ok(admins);
        }

        [HttpPost]
        public IActionResult AddAdmin([FromBody] AdminCreateRequest request)
        {
            if (_db.Admins.Any(a => a.UserName == request.UserName))
                return BadRequest("Username already exists.");

            var admin = new Admin
            {
                UserName = request.UserName,
                Role = request.Role ?? "Admin"
            };
            admin.PasswordHash = _hasher.HashPassword(admin, request.Password);

            _db.Admins.Add(admin);
            _db.SaveChanges();

            return Ok(admin);
        }
    }

    public class AdminCreateRequest
    {
        public string UserName { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? Role { get; set; }
    }
}









































































































































































































































































