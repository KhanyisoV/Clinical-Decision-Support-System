using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Repositories;
using FinalYearProject.Models;
using FinalYearProject.DTOs;
using System.Security.Claims;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MLPredictionController : ControllerBase
    {
        private readonly IMLPredictionRepository _predictionRepo;

        public MLPredictionController(IMLPredictionRepository predictionRepo)
        {
            _predictionRepo = predictionRepo;
        }

        // Get all predictions (Admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var predictions = await _predictionRepo.GetAllAsync();
                
                var predictionDtos = predictions.Select(p => new MLPredictionDto
                {
                    Id = p.Id,
                    ClientId = p.ClientId,
                    ClientName = $"{p.Client.FirstName} {p.Client.LastName}",
                    PredictedDiagnosis = p.PredictedDiagnosis,
                    ConfidenceScore = p.ConfidenceScore,
                    Symptoms = p.Symptoms,
                    AdditionalNotes = p.AdditionalNotes,
                    IsReviewedByDoctor = p.IsReviewedByDoctor,
                    ReviewedByDoctorName = p.ReviewedByDoctor != null 
                        ? $"{p.ReviewedByDoctor.FirstName} {p.ReviewedByDoctor.LastName}" 
                        : null,
                    ReviewedAt = p.ReviewedAt,
                    DoctorFeedback = p.DoctorFeedback,
                    DiagnosisId = p.DiagnosisId,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                }).ToList();

                return Ok(new ApiResponseDto<List<MLPredictionDto>>
                {
                    Success = true,
                    Data = predictionDtos,
                    Message = "ML predictions retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving predictions",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get prediction by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var prediction = await _predictionRepo.GetByIdAsync(id);
                
                if (prediction == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Prediction not found"
                    });
                }

                // Authorization check
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var userName = User.FindFirst(ClaimTypes.Name)?.Value;
                
                if (userRole == "Client" && prediction.Client.UserName != userName)
                {
                    return Forbid();
                }

                var predictionDto = new MLPredictionDto
                {
                    Id = prediction.Id,
                    ClientId = prediction.ClientId,
                    ClientName = $"{prediction.Client.FirstName} {prediction.Client.LastName}",
                    PredictedDiagnosis = prediction.PredictedDiagnosis,
                    ConfidenceScore = prediction.ConfidenceScore,
                    Symptoms = prediction.Symptoms,
                    AdditionalNotes = prediction.AdditionalNotes,
                    IsReviewedByDoctor = prediction.IsReviewedByDoctor,
                    ReviewedByDoctorName = prediction.ReviewedByDoctor != null 
                        ? $"{prediction.ReviewedByDoctor.FirstName} {prediction.ReviewedByDoctor.LastName}" 
                        : null,
                    ReviewedAt = prediction.ReviewedAt,
                    DoctorFeedback = prediction.DoctorFeedback,
                    DiagnosisId = prediction.DiagnosisId,
                    CreatedAt = prediction.CreatedAt,
                    UpdatedAt = prediction.UpdatedAt
                };

                return Ok(new ApiResponseDto<MLPredictionDto>
                {
                    Success = true,
                    Data = predictionDto,
                    Message = "Prediction retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving prediction",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get predictions for a specific client
        [HttpGet("client/{clientId}")]
        public async Task<IActionResult> GetByClientId(int clientId)
        {
            try
            {
                // Authorization check
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var userName = User.FindFirst(ClaimTypes.Name)?.Value;

                var predictions = await _predictionRepo.GetByClientIdAsync(clientId);
                
                // If client, ensure they can only see their own predictions
                if (userRole == "Client")
                {
                    predictions = predictions.Where(p => p.Client.UserName == userName).ToList();
                }

                var predictionDtos = predictions.Select(p => new MLPredictionDto
                {
                    Id = p.Id,
                    ClientId = p.ClientId,
                    ClientName = $"{p.Client.FirstName} {p.Client.LastName}",
                    PredictedDiagnosis = p.PredictedDiagnosis,
                    ConfidenceScore = p.ConfidenceScore,
                    Symptoms = p.Symptoms,
                    AdditionalNotes = p.AdditionalNotes,
                    IsReviewedByDoctor = p.IsReviewedByDoctor,
                    ReviewedByDoctorName = p.ReviewedByDoctor != null 
                        ? $"{p.ReviewedByDoctor.FirstName} {p.ReviewedByDoctor.LastName}" 
                        : null,
                    ReviewedAt = p.ReviewedAt,
                    DoctorFeedback = p.DoctorFeedback,
                    DiagnosisId = p.DiagnosisId,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                }).ToList();

                return Ok(new ApiResponseDto<List<MLPredictionDto>>
                {
                    Success = true,
                    Data = predictionDtos,
                    Message = "Client predictions retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving predictions",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get unreviewed predictions (Doctor/Admin only)
        [HttpGet("unreviewed")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> GetUnreviewed()
        {
            try
            {
                var predictions = await _predictionRepo.GetUnreviewedAsync();
                
                var predictionDtos = predictions.Select(p => new MLPredictionDto
                {
                    Id = p.Id,
                    ClientId = p.ClientId,
                    ClientName = $"{p.Client.FirstName} {p.Client.LastName}",
                    PredictedDiagnosis = p.PredictedDiagnosis,
                    ConfidenceScore = p.ConfidenceScore,
                    Symptoms = p.Symptoms,
                    AdditionalNotes = p.AdditionalNotes,
                    IsReviewedByDoctor = p.IsReviewedByDoctor,
                    CreatedAt = p.CreatedAt
                }).ToList();

                return Ok(new ApiResponseDto<List<MLPredictionDto>>
                {
                    Success = true,
                    Data = predictionDtos,
                    Message = "Unreviewed predictions retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving predictions",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Create new prediction
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MLPredictionCreateDto request)
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

                var prediction = new MLPrediction
                {
                    ClientId = request.ClientId,
                    PredictedDiagnosis = request.PredictedDiagnosis,
                    ConfidenceScore = request.ConfidenceScore,
                    Symptoms = request.Symptoms,
                    AdditionalNotes = request.AdditionalNotes,
                    CreatedAt = DateTime.UtcNow
                };

                await _predictionRepo.AddAsync(prediction);
                await _predictionRepo.SaveChangesAsync();

                return Ok(new ApiResponseDto<int>
                {
                    Success = true,
                    Data = prediction.Id,
                    Message = "ML prediction created successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while creating prediction",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Review prediction (Doctor only)
        [HttpPost("{id}/review")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Review(int id, [FromBody] MLPredictionReviewDto request)
        {
            try
            {
                var prediction = await _predictionRepo.GetByIdAsync(id);
                
                if (prediction == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Prediction not found"
                    });
                }

                if (prediction.IsReviewedByDoctor)
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Prediction has already been reviewed"
                    });
                }

                // Get doctor's username from claims
                var doctorUserName = User.FindFirst(ClaimTypes.Name)?.Value;
                // You'll need to fetch the doctor's ID from the database
                // For now, this assumes you have a way to get it

                prediction.IsReviewedByDoctor = true;
                prediction.DoctorFeedback = request.DoctorFeedback;
                prediction.ReviewedAt = DateTime.UtcNow;
                prediction.DiagnosisId = request.DiagnosisId;
                prediction.UpdatedAt = DateTime.UtcNow;
                // Set ReviewedByDoctorId based on the authenticated doctor

                await _predictionRepo.UpdateAsync(prediction);
                await _predictionRepo.SaveChangesAsync();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Prediction reviewed successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while reviewing prediction",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Delete prediction (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var prediction = await _predictionRepo.GetByIdAsync(id);
                
                if (prediction == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Prediction not found"
                    });
                }

                await _predictionRepo.DeleteAsync(id);
                await _predictionRepo.SaveChangesAsync();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Prediction deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting prediction",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}