using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FinalYearProject.Data;
using FinalYearProject.Models;
using FinalYearProject.DTOs;
using FinalYearProject.Repositories;
using System.Security.Claims;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TreatmentController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ITreatmentRepository _treatmentRepository;

        public TreatmentController(AppDbContext db, ITreatmentRepository treatmentRepository)
        {
            _db = db;
            _treatmentRepository = treatmentRepository;
        }

        // GET: api/treatment - All roles can view (filtered by role)
        [HttpGet]
        public async Task<IActionResult> GetTreatments()
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                IEnumerable<Treatment> treatments;

                // Client can only view their own treatments
                if (role == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null)
                    {
                        return NotFound(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Client not found"
                        });
                    }
                    treatments = await _treatmentRepository.GetByClientIdAsync(client.Id);
                }
                // Doctor can view treatments they provided or for their assigned clients
                else if (role == "Doctor")
                {
                    var doctor = await _db.Doctors
                        .Include(d => d.AssignedClients)
                        .FirstOrDefaultAsync(d => d.UserName == username);
                    
                    if (doctor == null)
                    {
                        return NotFound(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Doctor not found"
                        });
                    }

                    var assignedClientIds = doctor.AssignedClients.Select(c => c.Id).ToList();
                    var doctorTreatments = await _treatmentRepository.GetByDoctorIdAsync(doctor.Id);
                    var clientTreatments = await _treatmentRepository.GetByClientIdsAsync(assignedClientIds);
                    
                    treatments = doctorTreatments.Union(clientTreatments).Distinct();
                }
                // Admin can view all
                else
                {
                    treatments = await _treatmentRepository.GetAllAsync();
                }

                var treatmentDtos = treatments.Select(t => MapToDto(t)).ToList();

                return Ok(new ApiResponseDto<List<TreatmentDto>>
                {
                    Success = true,
                    Data = treatmentDtos,
                    Message = "Treatments retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving treatments",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/treatment/{id} - All roles can view (with filtering)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTreatment(int id)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                var treatment = await _treatmentRepository.GetByIdAsync(id);

                if (treatment == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Treatment not found"
                    });
                }

                // Authorization check
                if (role == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null || treatment.ClientId != client.Id)
                    {
                        return Forbid();
                    }
                }
                else if (role == "Doctor")
                {
                    var doctor = await _db.Doctors
                        .Include(d => d.AssignedClients)
                        .FirstOrDefaultAsync(d => d.UserName == username);
                    
                    if (doctor == null)
                    {
                        return Forbid();
                    }

                    var assignedClientIds = doctor.AssignedClients.Select(c => c.Id).ToList();
                    if (treatment.ProvidedByDoctorId != doctor.Id && !assignedClientIds.Contains(treatment.ClientId))
                    {
                        return Forbid();
                    }
                }

                var treatmentDto = MapToDto(treatment);

                return Ok(new ApiResponseDto<TreatmentDto>
                {
                    Success = true,
                    Data = treatmentDto,
                    Message = "Treatment retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving treatment",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/treatment/client/{clientId}/active
        [HttpGet("client/{clientId}/active")]
        public async Task<IActionResult> GetActiveTreatmentsByClient(int clientId)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // Authorization check
                if (role == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null || client.Id != clientId)
                    {
                        return Forbid();
                    }
                }

                var treatments = await _treatmentRepository.GetActiveTreatmentsByClientIdAsync(clientId);
                var treatmentDtos = treatments.Select(t => MapToDto(t)).ToList();

                return Ok(new ApiResponseDto<List<TreatmentDto>>
                {
                    Success = true,
                    Data = treatmentDtos,
                    Message = "Active treatments retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving active treatments",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/treatment/status/{status}
        [HttpGet("status/{status}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GetTreatmentsByStatus(string status)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                IEnumerable<Treatment> treatments;

                if (role == "Doctor")
                {
                    var doctor = await _db.Doctors
                        .Include(d => d.AssignedClients)
                        .FirstOrDefaultAsync(d => d.UserName == username);
                    
                    if (doctor == null)
                    {
                        return NotFound(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Doctor not found"
                        });
                    }

                    var assignedClientIds = doctor.AssignedClients.Select(c => c.Id).ToList();
                    var doctorTreatments = await _treatmentRepository.GetByDoctorIdAsync(doctor.Id);
                    var clientTreatments = await _treatmentRepository.GetByClientIdsAsync(assignedClientIds);
                    
                    treatments = doctorTreatments.Union(clientTreatments)
                        .Where(t => t.Status == status)
                        .Distinct();
                }
                else
                {
                    treatments = await _treatmentRepository.GetByStatusAsync(status);
                }

                var treatmentDtos = treatments.Select(t => MapToDto(t)).ToList();

                return Ok(new ApiResponseDto<List<TreatmentDto>>
                {
                    Success = true,
                    Data = treatmentDtos,
                    Message = $"Treatments with status '{status}' retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving treatments",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // POST: api/treatment - Only Doctors can create
        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> CreateTreatment([FromBody] TreatmentCreateDto request)
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

                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.UserName == username);

                if (doctor == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                // Verify that the doctor is creating treatment under their own name
                if (request.ProvidedByDoctorId != doctor.Id)
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "You can only create treatments under your own name"
                    });
                }

                // Verify client exists
                var client = await _db.Clients.FindAsync(request.ClientId);
                if (client == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Client not found"
                    });
                }

                // Verify prescription if provided
                if (request.PrescriptionId.HasValue)
                {
                    var prescription = await _db.Prescriptions.FindAsync(request.PrescriptionId.Value);
                    if (prescription == null)
                    {
                        return BadRequest(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Prescription not found"
                        });
                    }
                }

                // Verify appointment if provided
                if (request.NextAppointmentId.HasValue)
                {
                    var appointment = await _db.Appointments.FindAsync(request.NextAppointmentId.Value);
                    if (appointment == null)
                    {
                        return BadRequest(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Appointment not found"
                        });
                    }
                }

                // Verify diagnosis if provided
                if (request.DiagnosisId.HasValue)
                {
                    var diagnosis = await _db.Diagnoses.FindAsync(request.DiagnosisId.Value);
                    if (diagnosis == null)
                    {
                        return BadRequest(new ApiResponseDto
                        {
                            Success = false,
                            Message = "Diagnosis not found"
                        });
                    }
                }

                var treatment = new Treatment
                {
                    Title = request.Title,
                    Description = request.Description,
                    StartDate = request.StartDate,
                    EndDate = request.EndDate,
                    Status = request.Status,
                    TreatmentPlan = request.TreatmentPlan,
                    Goals = request.Goals,
                    ProgressNotes = request.ProgressNotes,
                    PrescriptionId = request.PrescriptionId,
                    NextAppointmentId = request.NextAppointmentId,
                    DiagnosisId = request.DiagnosisId,
                    ClientId = request.ClientId,
                    ProvidedByDoctorId = request.ProvidedByDoctorId
                };

                var createdTreatment = await _treatmentRepository.CreateAsync(treatment);
                var treatmentDto = MapToDto(createdTreatment);

                return Ok(new ApiResponseDto<TreatmentDto>
                {
                    Success = true,
                    Data = treatmentDto,
                    Message = "Treatment created successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while creating treatment",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // PUT: api/treatment/{id} - Only Doctors can update
        [HttpPut("{id}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> UpdateTreatment(int id, [FromBody] TreatmentUpdateDto request)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.UserName == username);

                if (doctor == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                var treatment = await _treatmentRepository.GetByIdAsync(id);
                if (treatment == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Treatment not found"
                    });
                }

                // Only the providing doctor can update
                if (treatment.ProvidedByDoctorId != doctor.Id)
                {
                    return Forbid();
                }

                // Update fields if provided
                if (request.Title != null) treatment.Title = request.Title;
                if (request.Description != null) treatment.Description = request.Description;
                if (request.StartDate.HasValue) treatment.StartDate = request.StartDate.Value;
                if (request.EndDate.HasValue) treatment.EndDate = request.EndDate;
                if (request.Status != null) treatment.Status = request.Status;
                if (request.TreatmentPlan != null) treatment.TreatmentPlan = request.TreatmentPlan;
                if (request.Goals != null) treatment.Goals = request.Goals;
                if (request.ProgressNotes != null) treatment.ProgressNotes = request.ProgressNotes;
                if (request.PrescriptionId.HasValue) treatment.PrescriptionId = request.PrescriptionId;
                if (request.NextAppointmentId.HasValue) treatment.NextAppointmentId = request.NextAppointmentId;
                if (request.DiagnosisId.HasValue) treatment.DiagnosisId = request.DiagnosisId;

                await _treatmentRepository.UpdateAsync(treatment);

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Treatment updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating treatment",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // DELETE: api/treatment/{id} - Only Doctors can delete
        [HttpDelete("{id}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> DeleteTreatment(int id)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.UserName == username);

                if (doctor == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                var treatment = await _treatmentRepository.GetByIdAsync(id);
                if (treatment == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Treatment not found"
                    });
                }

                // Only the providing doctor can delete
                if (treatment.ProvidedByDoctorId != doctor.Id)
                {
                    return Forbid();
                }

                await _treatmentRepository.DeleteAsync(id);

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Treatment deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting treatment",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Helper method to map entity to DTO
        private TreatmentDto MapToDto(Treatment treatment)
        {
            var dto = new TreatmentDto
            {
                Id = treatment.Id,
                Title = treatment.Title,
                Description = treatment.Description,
                StartDate = treatment.StartDate,
                EndDate = treatment.EndDate,
                Status = treatment.Status,
                TreatmentPlan = treatment.TreatmentPlan,
                Goals = treatment.Goals,
                ProgressNotes = treatment.ProgressNotes,
                PrescriptionId = treatment.PrescriptionId,
                NextAppointmentId = treatment.NextAppointmentId,
                DiagnosisId = treatment.DiagnosisId,
                Client = new ClientBasicDto
                {
                    UserName = treatment.Client.UserName,
                    FirstName = treatment.Client.FirstName,
                    LastName = treatment.Client.LastName
                },
                ProvidedByDoctor = new DoctorBasicDto
                {
                    UserName = treatment.ProvidedByDoctor.UserName,
                    FirstName = treatment.ProvidedByDoctor.FirstName,
                    LastName = treatment.ProvidedByDoctor.LastName,
                    Specialization = treatment.ProvidedByDoctor.Specialization
                },
                CreatedAt = treatment.CreatedAt,
                UpdatedAt = treatment.UpdatedAt
            };

            // Map Prescription if exists
            if (treatment.Prescription != null)
            {
                dto.Prescription = new PrescriptionDto
                {
                    Id = treatment.Prescription.Id,
                    MedicationName = treatment.Prescription.MedicationName,
                    Dosage = treatment.Prescription.Dosage,
                    Frequency = treatment.Prescription.Frequency,
                    StartDate = treatment.Prescription.StartDate,
                    EndDate = treatment.Prescription.EndDate,
                    Instructions = treatment.Prescription.Instructions,
                    Notes = treatment.Prescription.Notes,
                    Status = treatment.Prescription.Status,
                    IsActive = treatment.Prescription.IsActive,
                    Client = new ClientBasicDto
                    {
                        UserName = treatment.Client.UserName,
                        FirstName = treatment.Client.FirstName,
                        LastName = treatment.Client.LastName
                    },
                    PrescribedByDoctor = new DoctorBasicDto
                    {
                        UserName = treatment.Prescription.PrescribedByDoctor.UserName,
                        FirstName = treatment.Prescription.PrescribedByDoctor.FirstName,
                        LastName = treatment.Prescription.PrescribedByDoctor.LastName,
                        Specialization = treatment.Prescription.PrescribedByDoctor.Specialization
                    },
                    CreatedAt = treatment.Prescription.CreatedAt,
                    UpdatedAt = treatment.Prescription.UpdatedAt
                };
            }

            // Map Next Appointment if exists
            if (treatment.NextAppointment != null)
            {
                dto.NextAppointment = new AppointmentDto
                {
                    Id = treatment.NextAppointment.Id,
                    Title = treatment.NextAppointment.Title,
                    Description = treatment.NextAppointment.Description,
                    AppointmentDate = treatment.NextAppointment.AppointmentDate,
                    StartTime = treatment.NextAppointment.StartTime,
                    EndTime = treatment.NextAppointment.EndTime,
                    Status = treatment.NextAppointment.Status,
                    Location = treatment.NextAppointment.Location,
                    Notes = treatment.NextAppointment.Notes,
                    Client = new ClientBasicDto
                    {
                        UserName = treatment.Client.UserName,
                        FirstName = treatment.Client.FirstName,
                        LastName = treatment.Client.LastName
                    },
                    Doctor = new DoctorBasicDto
                    {
                        UserName = treatment.NextAppointment.Doctor.UserName,
                        FirstName = treatment.NextAppointment.Doctor.FirstName,
                        LastName = treatment.NextAppointment.Doctor.LastName,
                        Specialization = treatment.NextAppointment.Doctor.Specialization
                    },
                    CreatedAt = treatment.NextAppointment.CreatedAt,
                    UpdatedAt = treatment.NextAppointment.UpdatedAt
                };
            }

            // Map Diagnosis if exists
            if (treatment.Diagnosis != null)
            {
                dto.Diagnosis = new DiagnosisDto
                {
                    Title = treatment.Diagnosis.Title,
                    Description = treatment.Diagnosis.Description,
                    DiagnosisCode = treatment.Diagnosis.DiagnosisCode,
                    Severity = treatment.Diagnosis.Severity,
                    Status = treatment.Diagnosis.Status,
                    TreatmentPlan = treatment.Diagnosis.TreatmentPlan,
                    Notes = treatment.Diagnosis.Notes,
                    DateDiagnosed = treatment.Diagnosis.DateDiagnosed,
                    DateResolved = treatment.Diagnosis.DateResolved,
                    IsActive = treatment.Diagnosis.IsActive,
                    Client = new ClientBasicDto
                    {
                        UserName = treatment.Client.UserName,
                        FirstName = treatment.Client.FirstName,
                        LastName = treatment.Client.LastName
                    },
                    DiagnosedByDoctor = new DoctorBasicDto
                    {
                        UserName = treatment.Diagnosis.DiagnosedByDoctor.UserName,
                        FirstName = treatment.Diagnosis.DiagnosedByDoctor.FirstName,
                        LastName = treatment.Diagnosis.DiagnosedByDoctor.LastName,
                        Specialization = treatment.Diagnosis.DiagnosedByDoctor.Specialization
                    },
                    CreatedAt = treatment.Diagnosis.CreatedAt,
                    UpdatedAt = treatment.Diagnosis.UpdatedAt
                };
            }

            return dto;
        }
    }
}