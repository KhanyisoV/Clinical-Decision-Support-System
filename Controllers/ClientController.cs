using Microsoft.AspNetCore.Mvc;
using FinalYearProject.Repositories;
using FinalYearProject.Models;
using FinalYearProject.DTOs;
using FinalYearProject.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientController : ControllerBase
    {
        private readonly IClientRepository _clientRepo;
        private readonly IPasswordHasher<Client> _passwordHasher;
        private readonly ISymptomRepository _symptomRepo;
        private readonly IMappingService _mappingService;

        public ClientController(
            IClientRepository clientRepo, 
            IPasswordHasher<Client> passwordHasher, 
            ISymptomRepository symptomRepo,
            IMappingService mappingService)
        {
            _clientRepo = clientRepo;
            _passwordHasher = passwordHasher;
            _symptomRepo = symptomRepo;
            _mappingService = mappingService;
        }

        // Get client profile by username
[HttpGet("profile/{username}")]
[Authorize(Roles = "Client,Doctor,Admin")]
public IActionResult GetClientProfileByUsername(string username)
{
    try
    {
        var client = _clientRepo.GetByUserName(username);
        if (client == null)
        {
            return NotFound(new ApiResponseDto
            {
                Success = false,
                Message = $"Client with username {username} not found."
            });
        }

        var clientDto = _mappingService.ToClientDto(client);

        return Ok(new ApiResponseDto<ClientDto>
        {
            Success = true,
            Message = "Client profile retrieved successfully.",
            Data = clientDto
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new ApiResponseDto
        {
            Success = false,
            Message = "An error occurred while retrieving client profile.",
            Errors = new List<string> { ex.Message }
        });
    }
}

// Update client profile by username
[HttpPut("profile/{username}")]
[Authorize(Roles = "Client,Admin")]
public IActionResult UpdateClientProfileByUsername(string username, [FromBody] ClientUpdateDto request)
{
    try
    {
        var client = _clientRepo.GetByUserName(username);
        if (client == null)
        {
            return NotFound(new ApiResponseDto
            {
                Success = false,
                Message = $"Client with username {username} not found."
            });
        }

        // Check if username is being changed and if it already exists
        if (!string.IsNullOrEmpty(request.UserName) && request.UserName != client.UserName)
        {
            var existingClient = _clientRepo.GetByUserName(request.UserName);
            if (existingClient != null && existingClient.Id != client.Id)
            {
                return BadRequest(new ApiResponseDto
                {
                    Success = false,
                    Message = "Username already exists.",
                    Errors = new List<string> { "Username is already taken." }
                });
            }
        }

        // Update password if provided
        if (!string.IsNullOrEmpty(request.Password))
        {
            client.PasswordHash = _passwordHasher.HashPassword(client, request.Password);
        }

        _mappingService.UpdateClient(client, request);

        _clientRepo.Update(client);
        _clientRepo.Save();

        var clientDto = _mappingService.ToClientDto(client);

        return Ok(new ApiResponseDto<ClientDto>
        {
            Success = true,
            Message = "Client profile updated successfully.",
            Data = clientDto
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new ApiResponseDto
        {
            Success = false,
            Message = "An error occurred during profile update.",
            Errors = new List<string> { ex.Message }
        });
    }
}

        // Register API for patient/client
        [HttpPost("register")]
        public IActionResult Register([FromBody] ClientCreateDto request)
        {
            try
            {
                if (_clientRepo.GetByUserName(request.UserName) != null)
                {
                    return BadRequest(new ApiResponseDto 
                    { 
                        Success = false, 
                        Message = "Username already exists.",
                        Errors = new List<string> { "Username is already taken." }
                    });
                }

                var client = _mappingService.ToClient(request);
                client.PasswordHash = _passwordHasher.HashPassword(client, request.Password);

                _clientRepo.Add(client);
                _clientRepo.Save();

                var clientDto = _mappingService.ToClientDto(client);
                
                return Ok(new ApiResponseDto<ClientDto>
                {
                    Success = true,
                    Message = "Client registered successfully.",
                    Data = clientDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred during registration.",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Update client API
        [HttpPut("{id}")]
        [Authorize(Roles = "Client,Admin")]
        public IActionResult UpdateClient(int id, [FromBody] ClientUpdateDto request)
        {
            try
            {
                var client = _clientRepo.GetById(id);
                if (client == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = $"Client with ID {id} not found."
                    });
                }

                // Check if username is being changed and if it already exists
                if (!string.IsNullOrEmpty(request.UserName) && request.UserName != client.UserName)
                {
                    var existingClient = _clientRepo.GetByUserName(request.UserName);
                    if (existingClient != null && existingClient.Id != id)
                    {
                        return BadRequest(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Username already exists.",
                            Errors = new List<string> { "Username is already taken." }
                        });
                    }
                }

                // Update password if provided
                if (!string.IsNullOrEmpty(request.Password))
                {
                    client.PasswordHash = _passwordHasher.HashPassword(client, request.Password);
                }

                _mappingService.UpdateClient(client, request);

                _clientRepo.Update(client);
                _clientRepo.Save();

                var clientDto = _mappingService.ToClientDto(client);

                return Ok(new ApiResponseDto<ClientDto>
                {
                    Success = true,
                    Message = "Client updated successfully.",
                    Data = clientDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred during update.",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Delete client API
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteClient(int id)
        {
            try
            {
                var client = _clientRepo.GetById(id);
                if (client == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = $"Client with ID {id} not found."
                    });
                }

                _clientRepo.Delete(client);
                _clientRepo.Save();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Client deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred during deletion.",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get client by ID
        [HttpGet("{id}")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public IActionResult GetClient(int id)
        {
            try
            {
                var client = _clientRepo.GetById(id);
                if (client == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = $"Client with ID {id} not found."
                    });
                }

                var clientDto = _mappingService.ToClientDto(client);

                return Ok(new ApiResponseDto<ClientDto>
                {
                    Success = true,
                    Message = "Client retrieved successfully.",
                    Data = clientDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving client.",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get all clients (Admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAllClients()
        {
            try
            {
                var clients = _clientRepo.GetAll();
                var clientDtos = clients.Select(c => _mappingService.ToClientDto(c)).ToList();

                return Ok(new ApiResponseDto<List<ClientDto>>
                {
                    Success = true,
                    Message = "Clients retrieved successfully.",
                    Data = clientDtos
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving clients.",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get client symptoms
        [HttpGet("{id}/symptoms")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public IActionResult GetClientSymptoms(int id)
        {
            try
            {
                var client = _clientRepo.GetById(id);
                if (client == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = $"Client with ID {id} not found."
                    });
                }

                var symptoms = _symptomRepo.GetActiveSymptomsByClientId(id);
                var symptomDtos = symptoms.Select(s => _mappingService.ToSymptomDto(s)).ToList();

                return Ok(new ApiResponseDto<List<SymptomDto>>
                {
                    Success = true,
                    Message = "Client symptoms retrieved successfully.",
                    Data = symptomDtos
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving symptoms.",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get clients assigned to a specific doctor
        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Doctor,Admin")]
        public IActionResult GetClientsByDoctor(int doctorId)
        {
            try
            {
                var clients = _clientRepo.GetClientsByDoctorId(doctorId);
                var clientDtos = clients.Select(c => _mappingService.ToClientDto(c)).ToList();

                return Ok(new ApiResponseDto<List<ClientDto>>
                {
                    Success = true,
                    Message = "Doctor's clients retrieved successfully.",
                    Data = clientDtos
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving doctor's clients.",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}