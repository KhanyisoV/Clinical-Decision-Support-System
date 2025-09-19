using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Repositories;
using FinalYearProject.Models;
using System.ComponentModel.DataAnnotations;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiagnosisController : ControllerBase
    {
        private readonly IDiagnosisRepository _diagnosisRepo;
        private readonly IClientRepository _clientRepo;
        private readonly IDoctorRepository _doctorRepo;

        public DiagnosisController(
            IDiagnosisRepository diagnosisRepo,
            IClientRepository clientRepo,
            IDoctorRepository doctorRepo)
        {
            _diagnosisRepo = diagnosisRepo;
            _clientRepo = clientRepo;
            _doctorRepo = doctorRepo;
        }

        // Doctor adds diagnosis to client
        [HttpPost("add-to-client")]
        [Authorize(Roles = "Doctor")]
        public IActionResult AddDiagnosisToClient([FromBody] CreateDiagnosisRequest request)
        {
            try
            {
                // Verify the client exists
                var client = _clientRepo.GetById(request.ClientId);
                if (client == null)
                    return NotFound("Client not found");

                // Verify the doctor exists
                var doctor = _doctorRepo.GetById(request.DoctorId);
                if (doctor == null)
                    return NotFound("Doctor not found");

                var diagnosis = new Diagnosis
                {
                    Title = request.Title,
                    Description = request.Description,
                    DiagnosisCode = request.DiagnosisCode,
                    Severity = request.Severity,
                    Status = request.Status ?? "Active",
                    TreatmentPlan = request.TreatmentPlan,
                    Notes = request.Notes,
                    ClientId = request.ClientId,
                    DiagnosedByDoctorId = request.DoctorId
                };

                _diagnosisRepo.Add(diagnosis);
                _diagnosisRepo.Save();

                return Ok(new { Message = "Diagnosis added successfully", DiagnosisId = diagnosis.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Client views their own diagnoses
        [HttpGet("client/{clientId}")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public IActionResult GetClientDiagnoses(int clientId)
        {
            try
            {
                var diagnoses = _diagnosisRepo.GetByClientId(clientId);

                var result = diagnoses.Select(d => new
                {
                    d.Id,
                    d.Title,
                    d.Description,
                    d.DiagnosisCode,
                    d.Severity,
                    d.Status,
                    d.TreatmentPlan,
                    d.Notes,
                    d.DateDiagnosed,
                    d.DateResolved,
                    d.IsActive,
                    DiagnosedByDoctor = new
                    {
                        d.DiagnosedByDoctor.Id,
                        d.DiagnosedByDoctor.UserName,
                        d.DiagnosedByDoctor.FirstName,
                        d.DiagnosedByDoctor.LastName,
                        d.DiagnosedByDoctor.Specialization
                    }
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Doctor views diagnoses they made
        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Doctor,Admin")]
        public IActionResult GetDoctorDiagnoses(int doctorId)
        {
            try
            {
                var diagnoses = _diagnosisRepo.GetByDoctorId(doctorId);

                var result = diagnoses.Select(d => new
                {
                    d.Id,
                    d.Title,
                    d.Description,
                    d.DiagnosisCode,
                    d.Severity,
                    d.Status,
                    d.TreatmentPlan,
                    d.Notes,
                    d.DateDiagnosed,
                    d.DateResolved,
                    d.IsActive,
                    Client = new
                    {
                        d.Client.Id,
                        d.Client.UserName,
                        d.Client.FirstName,
                        d.Client.LastName
                    }
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Get single diagnosis
        [HttpGet("{id}")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public IActionResult GetDiagnosis(int id)
        {
            try
            {
                var diagnosis = _diagnosisRepo.GetById(id);
                if (diagnosis == null)
                    return NotFound("Diagnosis not found");

                var result = new
                {
                    diagnosis.Id,
                    diagnosis.Title,
                    diagnosis.Description,
                    diagnosis.DiagnosisCode,
                    diagnosis.Severity,
                    diagnosis.Status,
                    diagnosis.TreatmentPlan,
                    diagnosis.Notes,
                    diagnosis.DateDiagnosed,
                    diagnosis.DateResolved,
                    diagnosis.IsActive,
                    Client = new
                    {
                        diagnosis.Client.Id,
                        diagnosis.Client.UserName,
                        diagnosis.Client.FirstName,
                        diagnosis.Client.LastName
                    },
                    DiagnosedByDoctor = new
                    {
                        diagnosis.DiagnosedByDoctor.Id,
                        diagnosis.DiagnosedByDoctor.UserName,
                        diagnosis.DiagnosedByDoctor.FirstName,
                        diagnosis.DiagnosedByDoctor.LastName,
                        diagnosis.DiagnosedByDoctor.Specialization
                    }
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Update diagnosis (only by doctor)
        [HttpPut("{id}")]
        [Authorize(Roles = "Doctor")]
        public IActionResult UpdateDiagnosis(int id, [FromBody] UpdateDiagnosisRequest request)
        {
            try
            {
                var diagnosis = _diagnosisRepo.GetById(id);
                if (diagnosis == null)
                    return NotFound("Diagnosis not found");

                // Update properties if provided
                if (!string.IsNullOrEmpty(request.Title))
                    diagnosis.Title = request.Title;

                if (!string.IsNullOrEmpty(request.Description))
                    diagnosis.Description = request.Description;

                if (!string.IsNullOrEmpty(request.DiagnosisCode))
                    diagnosis.DiagnosisCode = request.DiagnosisCode;

                if (request.Severity.HasValue)
                    diagnosis.Severity = request.Severity.Value;

                if (!string.IsNullOrEmpty(request.Status))
                    diagnosis.Status = request.Status;

                if (!string.IsNullOrEmpty(request.TreatmentPlan))
                    diagnosis.TreatmentPlan = request.TreatmentPlan;

                if (!string.IsNullOrEmpty(request.Notes))
                    diagnosis.Notes = request.Notes;

                if (request.IsActive.HasValue)
                    diagnosis.IsActive = request.IsActive.Value;

                if (request.DateResolved.HasValue)
                    diagnosis.DateResolved = request.DateResolved;

                _diagnosisRepo.Update(diagnosis);
                _diagnosisRepo.Save();

                return Ok("Diagnosis updated successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Delete diagnosis (only by doctor)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Doctor,Admin")]
        public IActionResult DeleteDiagnosis(int id)
        {
            try
            {
                var diagnosis = _diagnosisRepo.GetById(id);
                if (diagnosis == null)
                    return NotFound("Diagnosis not found");

                _diagnosisRepo.Delete(diagnosis);
                _diagnosisRepo.Save();

                return Ok("Diagnosis deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Get active diagnoses for client (used by clients to view their current diagnoses)
        [HttpGet("client/{clientId}/active")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public IActionResult GetActiveDiagnoses(int clientId)
        {
            try
            {
                var diagnoses = _diagnosisRepo.GetActiveDiagnosesByClientId(clientId);

                var result = diagnoses.Select(d => new
                {
                    d.Id,
                    d.Title,
                    d.Description,
                    d.DiagnosisCode,
                    d.Severity,
                    d.Status,
                    d.TreatmentPlan,
                    d.DateDiagnosed,
                    DiagnosedByDoctor = new
                    {
                        d.DiagnosedByDoctor.FirstName,
                        d.DiagnosedByDoctor.LastName,
                        d.DiagnosedByDoctor.Specialization
                    }
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }

    // Request DTOs
    public class CreateDiagnosisRequest
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string? DiagnosisCode { get; set; }

        [Range(1, 5)]
        public int Severity { get; set; } = 1;

        public string? Status { get; set; } = "Active";

        public string? TreatmentPlan { get; set; }

        public string? Notes { get; set; }

        [Required]
        public int ClientId { get; set; }

        [Required]
        public int DoctorId { get; set; }
    }

    public class UpdateDiagnosisRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? DiagnosisCode { get; set; }

        [Range(1, 5)]
        public int? Severity { get; set; }

        public string? Status { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? Notes { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? DateResolved { get; set; }
    }
}