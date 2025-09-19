using Microsoft.AspNetCore.Mvc;
using FinalYearProject.Repositories;
using FinalYearProject.Models;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientController : ControllerBase
    {
        private readonly IClientRepository _clientRepo;
        private readonly IPasswordHasher<Client> _passwordHasher;
        private readonly ISymptomRepository _symptomRepo; // Added missing field

        // Fixed constructor - added ISymptomRepository parameter and field initialization
        public ClientController(IClientRepository clientRepo, IPasswordHasher<Client> passwordHasher, ISymptomRepository symptomRepo)
        {
            _clientRepo = clientRepo;
            _passwordHasher = passwordHasher;
            _symptomRepo = symptomRepo;
        }

        // Register api for patient/client
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (_clientRepo.GetByUserName(request.UserName) != null)
                    return BadRequest("Username already exists.");

                var client = new Client { UserName = request.UserName };
                client.PasswordHash = _passwordHasher.HashPassword(client, request.Password);

                _clientRepo.Add(client);
                _clientRepo.Save();

                return Ok(new { Message = "Client registered successfully.", ClientId = client.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Update client api
        [HttpPut("{id}")]
        public IActionResult UpdateClient(int id, [FromBody] UpdateClientRequest request)
        {
            try
            {
                var client = _clientRepo.GetById(id);
                if (client == null)
                    return NotFound($"Client with ID {id} not found.");

                // Check if username is being changed and if it already exists
                if (!string.IsNullOrEmpty(request.UserName) && request.UserName != client.UserName)
                {
                    var existingClient = _clientRepo.GetByUserName(request.UserName);
                    if (existingClient != null && existingClient.Id != id)
                        return BadRequest("Username already exists.");
                    
                    client.UserName = request.UserName;
                }

                // Update password if provided
                if (!string.IsNullOrEmpty(request.Password))
                {
                    client.PasswordHash = _passwordHasher.HashPassword(client, request.Password);
                }

                _clientRepo.Update(client);
                _clientRepo.Save();

                return Ok("Client updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Delete client api
        [HttpDelete("{id}")]
        public IActionResult DeleteClient(int id)
        {
            try
            {
                var client = _clientRepo.GetById(id);
                if (client == null)
                    return NotFound($"Client with ID {id} not found.");

                _clientRepo.Delete(client);
                _clientRepo.Save();

                return Ok("Client deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Get client by ID
        [HttpGet("{id}")]
        public IActionResult GetClient(int id)
        {
            try
            {
                var client = _clientRepo.GetById(id);
                if (client == null)
                    return NotFound($"Client with ID {id} not found.");

                // Return only necessary data, exclude sensitive information
                return Ok(new { client.Id, client.UserName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("{id}/symptoms")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public IActionResult GetClientSymptoms(int id)
        {
            try
            {
                var client = _clientRepo.GetById(id);
                if (client == null)
                    return NotFound($"Client with ID {id} not found.");

                var symptoms = _symptomRepo.GetActiveSymptomsByClientId(id);
                return Ok(symptoms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }

    public class RegisterRequest
    {
        public string UserName { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class UpdateClientRequest
    {
        public string? UserName { get; set; }
        public string? Password { get; set; }
    }
}