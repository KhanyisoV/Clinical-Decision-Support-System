using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Repositories;
using FinalYearProject.Models;
using Microsoft.AspNetCore.Identity;
using FinalYearProject.DTOs;
using FinalYearProject.Services;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorController : ControllerBase
    {
        private readonly IDoctorRepository _doctorRepo;
        private readonly IPasswordHasher<Doctor> _passwordHasher;

        public DoctorController(IDoctorRepository doctorRepo, IPasswordHasher<Doctor> passwordHasher)
        {
            _doctorRepo = doctorRepo;
            _passwordHasher = passwordHasher;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (_doctorRepo.GetByUserName(request.UserName) != null)
                return BadRequest("Username already exists.");

            var doctor = new Doctor { UserName = request.UserName };
            doctor.PasswordHash = _passwordHasher.HashPassword(doctor, request.Password);

            _doctorRepo.Add(doctor);
            _doctorRepo.Save();

            return Ok("Doctor registered successfully.");
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public IActionResult GetDoctors()
        {
            // Implementation needed - get from repository
            return Ok("Get all doctors");
        }
    }
}