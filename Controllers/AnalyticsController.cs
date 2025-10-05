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
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly IClientRepository _clientRepo;
        private readonly IDoctorRepository _doctorRepo;

        public AnalyticsController(
            IAnalyticsService analyticsService,
            IClientRepository clientRepo,
            IDoctorRepository doctorRepo)
        {
            _analyticsService = analyticsService;
            _clientRepo = clientRepo;
            _doctorRepo = doctorRepo;
        }

        // GET: api/analytics/client/{clientId}
        [HttpGet("client/{clientId}")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public async Task<IActionResult> GetClientAnalytics(
            int clientId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? groupBy = "Monthly")
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // Authorization checks
                if (role == "Client")
                {
                    var client = _clientRepo.GetByUserName(username!);
                    if (client == null || client.Id != clientId)
                    {
                        return Forbid();
                    }
                }
                else if (role == "Doctor")
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

                var filter = new AnalyticsFilterDto
                {
                    StartDate = startDate ?? DateTime.UtcNow.AddMonths(-6),
                    EndDate = endDate ?? DateTime.UtcNow,
                    GroupBy = groupBy
                };

                var analytics = await _analyticsService.GetClientAnalyticsAsync(clientId, filter);

                return Ok(new ApiResponseDto<ClientAnalyticsDto>
                {
                    Success = true,
                    Data = analytics,
                    Message = "Analytics retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving analytics",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/analytics/client/{clientId}/vital-trends
        [HttpGet("client/{clientId}/vital-trends")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public async Task<IActionResult> GetVitalTrends(
            int clientId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // Authorization
                if (!await AuthorizeClientAccess(clientId, username!, role!))
                {
                    return Forbid();
                }

                var filter = new AnalyticsFilterDto
                {
                    StartDate = startDate ?? DateTime.UtcNow.AddMonths(-6),
                    EndDate = endDate ?? DateTime.UtcNow
                };

                var analytics = await _analyticsService.GetClientAnalyticsAsync(clientId, filter);

                return Ok(new ApiResponseDto<ClinicalObservationTrendsDto>
                {
                    Success = true,
                    Data = analytics.ClinicalObservationTrends,
                    Message = "Vital trends retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving vital trends",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/analytics/client/{clientId}/symptom-trends
        [HttpGet("client/{clientId}/symptom-trends")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public async Task<IActionResult> GetSymptomTrends(
            int clientId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (!await AuthorizeClientAccess(clientId, username!, role!))
                {
                    return Forbid();
                }

                var filter = new AnalyticsFilterDto
                {
                    StartDate = startDate ?? DateTime.UtcNow.AddMonths(-6),
                    EndDate = endDate ?? DateTime.UtcNow
                };

                var analytics = await _analyticsService.GetClientAnalyticsAsync(clientId, filter);

                return Ok(new ApiResponseDto<SymptomAnalyticsDto>
                {
                    Success = true,
                    Data = analytics.SymptomAnalytics,
                    Message = "Symptom trends retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving symptom trends",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/analytics/client/{clientId}/health-score
        [HttpGet("client/{clientId}/health-score")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public async Task<IActionResult> GetHealthScore(int clientId)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (!await AuthorizeClientAccess(clientId, username!, role!))
                {
                    return Forbid();
                }

                var analytics = await _analyticsService.GetClientAnalyticsAsync(clientId);

                return Ok(new ApiResponseDto<OverallHealthScoreDto>
                {
                    Success = true,
                    Data = analytics.HealthScore,
                    Message = "Health score retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving health score",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/analytics/doctor/{doctorId}/clients-overview
        [HttpGet("doctor/{doctorId}/clients-overview")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> GetDoctorClientsOverview(int doctorId)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (role == "Doctor")
                {
                    var doctor = _doctorRepo.GetByUserName(username!);
                    if (doctor == null || doctor.Id != doctorId)
                    {
                        return Forbid();
                    }
                }

                var clients = _clientRepo.GetClientsByDoctorId(doctorId);
                var overviews = new List<object>();

                foreach (var client in clients)
                {
                    var analytics = await _analyticsService.GetClientAnalyticsAsync(client.Id);
                    overviews.Add(new
                    {
                        ClientId = client.Id,
                        ClientName = $"{client.FirstName} {client.LastName}".Trim(),
                        HealthScore = analytics.HealthScore.CurrentScore,
                        Trend = analytics.HealthScore.Trend,
                        ActiveSymptoms = analytics.SymptomAnalytics.ActiveSymptoms,
                        ActiveTreatments = analytics.TreatmentProgress.ActiveTreatments,
                        NextAppointment = analytics.AppointmentAnalytics.NextScheduledAppointment
                    });
                }

                return Ok(new ApiResponseDto<List<object>>
                {
                    Success = true,
                    Data = overviews,
                    Message = "Clients overview retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving clients overview",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Helper method for authorization
       // Helper method for authorization
        private Task<bool> AuthorizeClientAccess(int clientId, string username, string role)
        {
            if (role == "Admin") return Task.FromResult(true);

            if (role == "Client")
            {
                var client = _clientRepo.GetByUserName(username);
                return Task.FromResult(client != null && client.Id == clientId);
            }

            if (role == "Doctor")
            {
                var doctor = _doctorRepo.GetByUserName(username);
                if (doctor == null) return Task.FromResult(false);

                var client = _clientRepo.GetById(clientId);
                return Task.FromResult(client != null && client.AssignedDoctorId == doctor.Id);
            }

            return Task.FromResult(false);
        }
    }
}