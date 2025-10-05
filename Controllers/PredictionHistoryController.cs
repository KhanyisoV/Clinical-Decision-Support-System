using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Repositories;
using FinalYearProject.Models;
using FinalYearProject.DTOs;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PredictionHistoryController : ControllerBase
    {
        private readonly IPredictionHistoryRepository _historyRepo;
        private readonly IMLPredictionRepository _predictionRepo;

        public PredictionHistoryController(
            IPredictionHistoryRepository historyRepo,
            IMLPredictionRepository predictionRepo)
        {
            _historyRepo = historyRepo;
            _predictionRepo = predictionRepo;
        }

        // Get all history (Admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var histories = await _historyRepo.GetAllAsync();
                
                var historyDtos = histories.Select(h => MapToDto(h)).ToList();

                return Ok(new ApiResponseDto<List<PredictionHistoryDto>>
                {
                    Success = true,
                    Data = historyDtos,
                    Message = "Prediction histories retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving histories",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get history by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var history = await _historyRepo.GetByIdAsync(id);
                
                if (history == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "History not found"
                    });
                }

                // Authorization check
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var userName = User.FindFirst(ClaimTypes.Name)?.Value;
                
                if (userRole == "Client" && history.Client.UserName != userName)
                {
                    return Forbid();
                }

                return Ok(new ApiResponseDto<PredictionHistoryDto>
                {
                    Success = true,
                    Data = MapToDto(history),
                    Message = "History retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving history",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get history for a specific client
        [HttpGet("client/{clientId}")]
        public async Task<IActionResult> GetByClientId(int clientId)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var userName = User.FindFirst(ClaimTypes.Name)?.Value;

                var histories = await _historyRepo.GetByClientIdAsync(clientId);
                
                if (userRole == "Client")
                {
                    histories = histories.Where(h => h.Client.UserName == userName).ToList();
                }

                var historyDtos = histories.Select(h => MapToDto(h)).ToList();

                return Ok(new ApiResponseDto<List<PredictionHistoryDto>>
                {
                    Success = true,
                    Data = historyDtos,
                    Message = "Client histories retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving histories",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get history by ML Prediction ID
        [HttpGet("prediction/{mlPredictionId}")]
        public async Task<IActionResult> GetByMLPredictionId(int mlPredictionId)
        {
            try
            {
                var histories = await _historyRepo.GetByMLPredictionIdAsync(mlPredictionId);
                var historyDtos = histories.Select(h => MapToDto(h)).ToList();

                return Ok(new ApiResponseDto<List<PredictionHistoryDto>>
                {
                    Success = true,
                    Data = historyDtos,
                    Message = "Prediction histories retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving histories",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get history by status
        [HttpGet("status/{status}")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> GetByStatus(string status)
        {
            try
            {
                var histories = await _historyRepo.GetByStatusAsync(status);
                var historyDtos = histories.Select(h => MapToDto(h)).ToList();

                return Ok(new ApiResponseDto<List<PredictionHistoryDto>>
                {
                    Success = true,
                    Data = historyDtos,
                    Message = $"Histories with status '{status}' retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving histories",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get accuracy statistics
        [HttpGet("stats/accuracy")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> GetAccuracyStats()
        {
            try
            {
                var histories = await _historyRepo.GetAllAsync();

                var stats = new PredictionAccuracyStatsDto
                {
                    TotalPredictions = histories.Count,
                    ReviewedPredictions = histories.Count(h => h.Status == "Reviewed" || h.Status == "Confirmed" || h.Status == "Rejected"),
                    AccuratePredictions = histories.Count(h => h.WasAccurate),
                    InaccuratePredictions = histories.Count(h => h.Status == "Reviewed" && !h.WasAccurate),
                    AccuracyRate = histories.Count(h => h.Status == "Reviewed") > 0 
                        ? Math.Round((double)histories.Count(h => h.WasAccurate) / histories.Count(h => h.Status == "Reviewed") * 100, 2) 
                        : 0,
                    PredictionsByStatus = histories.GroupBy(h => h.Status)
                        .ToDictionary(g => g.Key, g => g.Count()),
                    TopPredictedConditions = histories.GroupBy(h => h.PredictedDiagnosis)
                        .OrderByDescending(g => g.Count())
                        .Take(10)
                        .ToDictionary(g => g.Key, g => g.Count())
                };

                return Ok(new ApiResponseDto<PredictionAccuracyStatsDto>
                {
                    Success = true,
                    Data = stats,
                    Message = "Accuracy statistics retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving statistics",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Create history entry
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PredictionHistoryCreateDto request)
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

                var prediction = await _predictionRepo.GetByIdAsync(request.MLPredictionId);
                if (prediction == null)
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "ML Prediction not found"
                    });
                }

                var history = new PredictionHistory
                {
                    MLPredictionId = request.MLPredictionId,
                    ClientId = request.ClientId,
                    PredictedDiagnosis = request.PredictedDiagnosis,
                    ConfidenceScore = request.ConfidenceScore,
                    Symptoms = request.Symptoms,
                    Notes = request.Notes,
                    PredictedAt = DateTime.UtcNow
                };

                await _historyRepo.AddAsync(history);
                await _historyRepo.SaveChangesAsync();

                return Ok(new ApiResponseDto<int>
                {
                    Success = true,
                    Data = history.Id,
                    Message = "Prediction history created successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while creating history",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Update history (Doctor only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] PredictionHistoryUpdateDto request)
        {
            try
            {
                var history = await _historyRepo.GetByIdAsync(id);
                
                if (history == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "History not found"
                    });
                }

                if (request.Status != null) history.Status = request.Status;
                if (request.ActualDiagnosisId.HasValue) history.ActualDiagnosisId = request.ActualDiagnosisId;
                if (request.ActualDiagnosisName != null) history.ActualDiagnosisName = request.ActualDiagnosisName;
                if (request.WasAccurate.HasValue) history.WasAccurate = request.WasAccurate.Value;
                if (request.Notes != null) history.Notes = request.Notes;

                if (request.Status == "Reviewed" || request.Status == "Confirmed" || request.Status == "Rejected")
                {
                    history.ReviewedAt = DateTime.UtcNow;
                    // Set ReviewedByDoctorId from authenticated user
                }

                await _historyRepo.UpdateAsync(history);
                await _historyRepo.SaveChangesAsync();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "History updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating history",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Delete history (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var history = await _historyRepo.GetByIdAsync(id);
                
                if (history == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "History not found"
                    });
                }

                await _historyRepo.DeleteAsync(id);
                await _historyRepo.SaveChangesAsync();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "History deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting history",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        private PredictionHistoryDto MapToDto(PredictionHistory history)
        {
            return new PredictionHistoryDto
            {
                Id = history.Id,
                MLPredictionId = history.MLPredictionId,
                ClientId = history.ClientId,
                ClientName = $"{history.Client.FirstName} {history.Client.LastName}",
                PredictedDiagnosis = history.PredictedDiagnosis,
                ConfidenceScore = history.ConfidenceScore,
                Symptoms = history.Symptoms,
                Status = history.Status,
                ActualDiagnosisId = history.ActualDiagnosisId,
                ActualDiagnosisName = history.ActualDiagnosisName,
                WasAccurate = history.WasAccurate,
                Notes = history.Notes,
                PredictedAt = history.PredictedAt,
                ReviewedAt = history.ReviewedAt,
                ReviewedByDoctorName = history.ReviewedByDoctor != null 
                    ? $"{history.ReviewedByDoctor.FirstName} {history.ReviewedByDoctor.LastName}" 
                    : null
            };
        }
    }
}