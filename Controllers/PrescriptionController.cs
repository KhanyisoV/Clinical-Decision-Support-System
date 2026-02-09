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
    public class PrescriptionController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IPrescriptionRepository _prescriptionRepository;

        public PrescriptionController(AppDbContext db, IPrescriptionRepository prescriptionRepository)
        {
            _db = db;
            _prescriptionRepository = prescriptionRepository;
        }

        // GET: api/prescription - Admin and Client can view all (filtered by role)
        [HttpGet]
        public async Task<IActionResult> GetPrescriptions()
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                IEnumerable<Prescription> prescriptions;

                // Client can only view their own prescriptions
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
                    prescriptions = await _prescriptionRepository.GetByClientIdAsync(client.Id);
                }
                // Doctor can view prescriptions they created or for their assigned clients
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
                    var doctorPrescriptions = await _prescriptionRepository.GetByDoctorIdAsync(doctor.Id);
                    var clientPrescriptions = await _prescriptionRepository.GetByClientIdsAsync(assignedClientIds);
                    
                    prescriptions = doctorPrescriptions.Union(clientPrescriptions).Distinct();
                }
                // Admin can view all
                else
                {
                    prescriptions = await _prescriptionRepository.GetAllAsync();
                }

                var prescriptionDtos = prescriptions.Select(p => new PrescriptionDto
                {
                    Id = p.Id,
                    MedicationName = p.MedicationName,
                    Dosage = p.Dosage,
                    Frequency = p.Frequency,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Instructions = p.Instructions,
                    Notes = p.Notes,
                    Status = p.Status,
                    IsActive = p.IsActive,
                    Client = new ClientBasicDto
                    {
                        UserName = p.Client.UserName,
                        FirstName = p.Client.FirstName,
                        LastName = p.Client.LastName
                    },
                    PrescribedByDoctor = new DoctorBasicDto
                    {
                        UserName = p.PrescribedByDoctor.UserName,
                        FirstName = p.PrescribedByDoctor.FirstName,
                        LastName = p.PrescribedByDoctor.LastName,
                        Specialization = p.PrescribedByDoctor.Specialization
                    },
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                }).ToList();

                return Ok(new ApiResponseDto<List<PrescriptionDto>>
                {
                    Success = true,
                    Data = prescriptionDtos,
                    Message = "Prescriptions retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving prescriptions",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/prescription/{id} - All roles can view (with filtering)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPrescription(int id)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                var prescription = await _prescriptionRepository.GetByIdAsync(id);

                if (prescription == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Prescription not found"
                    });
                }

                // Authorization check
                if (role == "Client")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserName == username);
                    if (client == null || prescription.ClientId != client.Id)
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
                    if (prescription.PrescribedByDoctorId != doctor.Id && !assignedClientIds.Contains(prescription.ClientId))
                    {
                        return Forbid();
                    }
                }

                var prescriptionDto = new PrescriptionDto
                {
                    Id = prescription.Id,
                    MedicationName = prescription.MedicationName,
                    Dosage = prescription.Dosage,
                    Frequency = prescription.Frequency,
                    StartDate = prescription.StartDate,
                    EndDate = prescription.EndDate,
                    Instructions = prescription.Instructions,
                    Notes = prescription.Notes,
                    Status = prescription.Status,
                    IsActive = prescription.IsActive,
                    Client = new ClientBasicDto
                    {
                        UserName = prescription.Client.UserName,
                        FirstName = prescription.Client.FirstName,
                        LastName = prescription.Client.LastName
                    },
                    PrescribedByDoctor = new DoctorBasicDto
                    {
                        UserName = prescription.PrescribedByDoctor.UserName,
                        FirstName = prescription.PrescribedByDoctor.FirstName,
                        LastName = prescription.PrescribedByDoctor.LastName,
                        Specialization = prescription.PrescribedByDoctor.Specialization
                    },
                    CreatedAt = prescription.CreatedAt,
                    UpdatedAt = prescription.UpdatedAt
                };

                return Ok(new ApiResponseDto<PrescriptionDto>
                {
                    Success = true,
                    Data = prescriptionDto,
                    Message = "Prescription retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving prescription",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/prescription/client/{clientId}/active
        [HttpGet("client/{clientId}/active")]
        public async Task<IActionResult> GetActivePrescriptionsByClient(int clientId)
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

                var prescriptions = await _prescriptionRepository.GetActivePrescriptionsByClientIdAsync(clientId);

                var prescriptionDtos = prescriptions.Select(p => new PrescriptionDto
                {
                    Id = p.Id,
                    MedicationName = p.MedicationName,
                    Dosage = p.Dosage,
                    Frequency = p.Frequency,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Instructions = p.Instructions,
                    Notes = p.Notes,
                    Status = p.Status,
                    IsActive = p.IsActive,
                    Client = new ClientBasicDto
                    {
                        UserName = p.Client.UserName,
                        FirstName = p.Client.FirstName,
                        LastName = p.Client.LastName
                    },
                    PrescribedByDoctor = new DoctorBasicDto
                    {
                        UserName = p.PrescribedByDoctor.UserName,
                        FirstName = p.PrescribedByDoctor.FirstName,
                        LastName = p.PrescribedByDoctor.LastName,
                        Specialization = p.PrescribedByDoctor.Specialization
                    },
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                }).ToList();

                return Ok(new ApiResponseDto<List<PrescriptionDto>>
                {
                    Success = true,
                    Data = prescriptionDtos,
                    Message = "Active prescriptions retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving active prescriptions",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // POST: api/prescription - Only Doctors can create
        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> CreatePrescription([FromBody] PrescriptionCreateDto request)
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

                // Verify that the doctor is prescribing for themselves
                if (request.PrescribedByDoctorId != doctor.Id)
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "You can only create prescriptions under your own name"
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

                var prescription = new Prescription
                {
                    MedicationName = request.MedicationName,
                    Dosage = request.Dosage,
                    Frequency = request.Frequency,
                    StartDate = request.StartDate,
                    EndDate = request.EndDate,
                    Instructions = request.Instructions,
                    Notes = request.Notes,
                    Status = request.Status,
                    ClientId = request.ClientId,
                    PrescribedByDoctorId = request.PrescribedByDoctorId
                };

                var createdPrescription = await _prescriptionRepository.CreateAsync(prescription);

                var prescriptionDto = new PrescriptionDto
                {
                    Id = createdPrescription.Id,
                    MedicationName = createdPrescription.MedicationName,
                    Dosage = createdPrescription.Dosage,
                    Frequency = createdPrescription.Frequency,
                    StartDate = createdPrescription.StartDate,
                    EndDate = createdPrescription.EndDate,
                    Instructions = createdPrescription.Instructions,
                    Notes = createdPrescription.Notes,
                    Status = createdPrescription.Status,
                    IsActive = createdPrescription.IsActive,
                    Client = new ClientBasicDto
                    {
                        UserName = createdPrescription.Client.UserName,
                        FirstName = createdPrescription.Client.FirstName,
                        LastName = createdPrescription.Client.LastName
                    },
                    PrescribedByDoctor = new DoctorBasicDto
                    {
                        UserName = createdPrescription.PrescribedByDoctor.UserName,
                        FirstName = createdPrescription.PrescribedByDoctor.FirstName,
                        LastName = createdPrescription.PrescribedByDoctor.LastName,
                        Specialization = createdPrescription.PrescribedByDoctor.Specialization
                    },
                    CreatedAt = createdPrescription.CreatedAt
                };

                return Ok(new ApiResponseDto<PrescriptionDto>
                {
                    Success = true,
                    Data = prescriptionDto,
                    Message = "Prescription created successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while creating prescription",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // PUT: api/prescription/{id} - Only Doctors can update
        [HttpPut("{id}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> UpdatePrescription(int id, [FromBody] PrescriptionUpdateDto request)
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

                var prescription = await _prescriptionRepository.GetByIdAsync(id);
                if (prescription == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Prescription not found"
                    });
                }

                // Only the prescribing doctor can update
                if (prescription.PrescribedByDoctorId != doctor.Id)
                {
                    return Forbid();
                }

                // Update fields if provided
                if (request.MedicationName != null) prescription.MedicationName = request.MedicationName;
                if (request.Dosage != null) prescription.Dosage = request.Dosage;
                if (request.Frequency != null) prescription.Frequency = request.Frequency;
                if (request.StartDate.HasValue) prescription.StartDate = request.StartDate.Value;
                if (request.EndDate.HasValue) prescription.EndDate = request.EndDate;
                if (request.Instructions != null) prescription.Instructions = request.Instructions;
                if (request.Notes != null) prescription.Notes = request.Notes;
                if (request.Status != null) prescription.Status = request.Status;
                if (request.IsActive.HasValue) prescription.IsActive = request.IsActive.Value;

                await _prescriptionRepository.UpdateAsync(prescription);

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Prescription updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating prescription",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // DELETE: api/prescription/{id} - Only Doctors can delete
        [HttpDelete("{id}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> DeletePrescription(int id)
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

                var prescription = await _prescriptionRepository.GetByIdAsync(id);
                if (prescription == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Prescription not found"
                    });
                }

                // Only the prescribing doctor can delete
                if (prescription.PrescribedByDoctorId != doctor.Id)
                {
                    return Forbid();
                }

                await _prescriptionRepository.DeleteAsync(id);

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Prescription deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting prescription",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}