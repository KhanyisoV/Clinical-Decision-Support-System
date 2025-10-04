using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Services;
using FinalYearProject.DTOs;
using FinalYearProject.Repositories;
using System.Security.Claims;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClientHistoryController : ControllerBase
    {
        private readonly IClientHistoryService _historyService;
        private readonly IClientRepository _clientRepo;
        private readonly IDoctorRepository _doctorRepo;

        public ClientHistoryController(
            IClientHistoryService historyService,
            IClientRepository clientRepo,
            IDoctorRepository doctorRepo)
        {
            _historyService = historyService;
            _clientRepo = clientRepo;
            _doctorRepo = doctorRepo;
        }

        // GET: api/clienthistory/{clientId} - Complete history
        [HttpGet("{clientId}")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> GetClientHistory(int clientId)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // Authorization: Doctor can only view their assigned clients' history
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

                    var client = _clientRepo.GetById(clientId);
                    if (client == null || client.AssignedDoctorId != doctor.Id)
                    {
                        return Forbid();
                    }
                }

                var history = await _historyService.GetClientHistoryAsync(clientId);

                return Ok(new ApiResponseDto<ClientHistoryDto>
                {
                    Success = true,
                    Data = history,
                    Message = "Client history retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving client history",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/clienthistory/{clientId}/filtered - Filtered history
        [HttpGet("{clientId}/filtered")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> GetFilteredClientHistory(
            int clientId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? eventTypes,
            [FromQuery] bool includeInactive = false,
            [FromQuery] int? doctorId = null)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // Authorization: Doctor can only view their assigned clients' history
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

                    var client = _clientRepo.GetById(clientId);
                    if (client == null || client.AssignedDoctorId != doctor.Id)
                    {
                        return Forbid();
                    }
                }

                var filter = new ClientHistoryFilterDto
                {
                    ClientId = clientId,
                    StartDate = startDate,
                    EndDate = endDate,
                    EventTypes = string.IsNullOrEmpty(eventTypes) 
                        ? null 
                        : eventTypes.Split(',').Select(e => e.Trim()).ToList(),
                    IncludeInactive = includeInactive,
                    DoctorId = doctorId
                };

                var history = await _historyService.GetClientHistoryAsync(clientId, filter);

                return Ok(new ApiResponseDto<ClientHistoryDto>
                {
                    Success = true,
                    Data = history,
                    Message = "Filtered client history retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving filtered client history",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/clienthistory/{clientId}/timeline - Timeline view
        [HttpGet("{clientId}/timeline")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> GetClientTimeline(
            int clientId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? eventTypes,
            [FromQuery] bool includeInactive = false)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // Authorization: Doctor can only view their assigned clients' history
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

                    var client = _clientRepo.GetById(clientId);
                    if (client == null || client.AssignedDoctorId != doctor.Id)
                    {
                        return Forbid();
                    }
                }

                var filter = new ClientHistoryFilterDto
                {
                    ClientId = clientId,
                    StartDate = startDate,
                    EndDate = endDate,
                    EventTypes = string.IsNullOrEmpty(eventTypes) 
                        ? null 
                        : eventTypes.Split(',').Select(e => e.Trim()).ToList(),
                    IncludeInactive = includeInactive
                };

                var timeline = await _historyService.GetClientTimelineAsync(clientId, filter);

                return Ok(new ApiResponseDto<List<ClientTimelineEventDto>>
                {
                    Success = true,
                    Data = timeline,
                    Message = "Client timeline retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving client timeline",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/clienthistory/{clientId}/summary - Summary only
        [HttpGet("{clientId}/summary")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> GetClientHistorySummary(int clientId)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // Authorization: Doctor can only view their assigned clients' history
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

                    var client = _clientRepo.GetById(clientId);
                    if (client == null || client.AssignedDoctorId != doctor.Id)
                    {
                        return Forbid();
                    }
                }

                var history = await _historyService.GetClientHistoryAsync(clientId);

                return Ok(new ApiResponseDto<ClientHistorySummaryDto>
                {
                    Success = true,
                    Data = history.Summary,
                    Message = "Client history summary retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving client history summary",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/clienthistory/doctor/{doctorId}/clients - All clients for a doctor with summaries
        [HttpGet("doctor/{doctorId}/clients")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> GetDoctorClientsHistory(int doctorId)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // Authorization: Doctor can only view their own clients
                if (role == "Doctor")
                {
                    var doctor = _doctorRepo.GetByUserName(username!);
                    if (doctor == null || doctor.Id != doctorId)
                    {
                        return Forbid();
                    }
                }

                var clients = _clientRepo.GetClientsByDoctorId(doctorId);
                var clientHistories = new List<object>();

                foreach (var client in clients)
                {
                    var history = await _historyService.GetClientHistoryAsync(client.Id);
                    clientHistories.Add(new
                    {
                        ClientId = client.Id,
                        ClientName = $"{client.FirstName} {client.LastName}".Trim(),
                        Client = new ClientBasicDto
                        {
                            UserName = client.UserName,
                            FirstName = client.FirstName,
                            LastName = client.LastName
                        },
                        Summary = history.Summary
                    });
                }

                return Ok(new ApiResponseDto<List<object>>
                {
                    Success = true,
                    Data = clientHistories,
                    Message = "Doctor's clients history retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving doctor's clients history",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/clienthistory/{clientId}/by-type/{type} - Get specific type of records
        [HttpGet("{clientId}/by-type/{type}")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> GetClientHistoryByType(int clientId, string type)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // Authorization: Doctor can only view their assigned clients' history
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

                    var client = _clientRepo.GetById(clientId);
                    if (client == null || client.AssignedDoctorId != doctor.Id)
                    {
                        return Forbid();
                    }
                }

                var filter = new ClientHistoryFilterDto
                {
                    ClientId = clientId,
                    EventTypes = new List<string> { type }
                };

                var history = await _historyService.GetClientHistoryAsync(clientId, filter);

                object data = type.ToLower() switch
                {
                    "diagnosis" => history.Diagnoses,
                    "treatment" => history.Treatments,
                    "appointment" => history.Appointments,
                    "prescription" => history.Prescriptions,
                    "symptom" => history.Symptoms,
                    "observation" => history.ClinicalObservations,
                    "recommendation" => history.Recommendations,
                    "progress" => history.ProgressRecords,
                    _ => throw new ArgumentException($"Invalid type: {type}")
                };

                return Ok(new ApiResponseDto<object>
                {
                    Success = true,
                    Data = data,
                    Message = $"Client {type} records retrieved successfully"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponseDto
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving client records",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/clienthistory/{clientId}/export - Export history as comprehensive report
        [HttpGet("{clientId}/export")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> ExportClientHistory(int clientId, [FromQuery] string format = "json")
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // Authorization: Doctor can only view their assigned clients' history
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

                    var client = _clientRepo.GetById(clientId);
                    if (client == null || client.AssignedDoctorId != doctor.Id)
                    {
                        return Forbid();
                    }
                }

                var history = await _historyService.GetClientHistoryAsync(clientId);

                // For now, return JSON. Can be extended to support PDF, CSV, etc.
                if (format.ToLower() == "json")
                {
                    return Ok(history);
                }

                return BadRequest(new ApiResponseDto
                {
                    Success = false,
                    Message = $"Export format '{format}' is not supported. Supported formats: json"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while exporting client history",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}