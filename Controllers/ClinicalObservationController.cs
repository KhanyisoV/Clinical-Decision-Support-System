using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalYearProject.Repositories;
using FinalYearProject.Models;
using FinalYearProject.DTOs;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClinicalObservationController : ControllerBase
    {
        private readonly IClinicalObservationRepository _observationRepo;
        private readonly IClientRepository _clientRepo;
        private readonly IDoctorRepository _doctorRepo;

        public ClinicalObservationController(
            IClinicalObservationRepository observationRepo,
            IClientRepository clientRepo,
            IDoctorRepository doctorRepo)
        {
            _observationRepo = observationRepo;
            _clientRepo = clientRepo;
            _doctorRepo = doctorRepo;
        }

        // Doctor creates a clinical observation for a client
        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public IActionResult Create([FromBody] ClinicalObservationCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var observation = new ClinicalObservation
                {
                    Gender = dto.Gender,
                    Age = dto.Age,
                    Height = dto.Height,
                    Weight = dto.Weight,
                    BloodPressure = dto.BloodPressure,
                    HeartRate = dto.HeartRate,
                    ObservationType = dto.ObservationType,
                    Value = dto.Value,
                    Notes = dto.Notes,
                    ClientId = dto.ClientId,
                    RecordedByDoctorId = dto.RecordedByDoctorId,
                    CreatedAt = DateTime.UtcNow
                };

                // Handle ObservationDate safely
                if (dto.ObservationDate != default)
                    observation.ObservationDate = dto.ObservationDate;
                else
                    observation.ObservationDate = DateTime.UtcNow;

                _observationRepo.Add(observation);
                _observationRepo.Save();


                return Ok(new { message = "Observation created successfully", id = observation.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }


        // Get all clinical observations (Admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAllObservations()
        {
            try
            {
                var observations = _observationRepo.GetAll();

                var result = observations.Select(o => new ClinicalObservationDto
                {
                    Id = o.Id,
                    Gender = o.Gender,
                    Age = o.Age,
                    Height = o.Height,
                    Weight = o.Weight,
                    BloodPressure = o.BloodPressure,
                    HeartRate = o.HeartRate,
                    Notes = o.Notes,
                    ObservationDate = o.ObservationDate,
                    Client = new ClientBasicDto
                    {
                        UserName = o.Client.UserName,
                        FirstName = o.Client.FirstName,
                        LastName = o.Client.LastName
                    },
                    RecordedByDoctor = new DoctorBasicDto
                    {
                        UserName = o.RecordedByDoctor.UserName,
                        FirstName = o.RecordedByDoctor.FirstName,
                        LastName = o.RecordedByDoctor.LastName,
                        Specialization = o.RecordedByDoctor.Specialization
                    },
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt
                }).ToList();

                return Ok(new ApiResponseDto<List<ClinicalObservationDto>>
                {
                    Success = true,
                    Data = result,
                    Message = "Clinical observations retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving clinical observations",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get single clinical observation by ID (Client, Doctor, Admin)
        [HttpGet("{id}")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public IActionResult GetObservation(int id)
        {
            try
            {
                var observation = _observationRepo.GetById(id);
                if (observation == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Clinical observation not found"
                    });
                }

                var result = new ClinicalObservationDto
                {
                    Id = observation.Id,
                    Gender = observation.Gender,
                    Age = observation.Age,
                    Height = observation.Height,
                    Weight = observation.Weight,
                    BloodPressure = observation.BloodPressure,
                    HeartRate = observation.HeartRate,
                    Notes = observation.Notes,
                    ObservationDate = observation.ObservationDate,
                    Client = new ClientBasicDto
                    {
                        UserName = observation.Client.UserName,
                        FirstName = observation.Client.FirstName,
                        LastName = observation.Client.LastName
                    },
                    RecordedByDoctor = new DoctorBasicDto
                    {
                        UserName = observation.RecordedByDoctor.UserName,
                        FirstName = observation.RecordedByDoctor.FirstName,
                        LastName = observation.RecordedByDoctor.LastName,
                        Specialization = observation.RecordedByDoctor.Specialization
                    },
                    CreatedAt = observation.CreatedAt,
                    UpdatedAt = observation.UpdatedAt
                };

                return Ok(new ApiResponseDto<ClinicalObservationDto>
                {
                    Success = true,
                    Data = result,
                    Message = "Clinical observation retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving clinical observation",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get clinical observations for a specific client (Client, Doctor, Admin)
        [HttpGet("client/{clientId}")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public IActionResult GetClientObservations(int clientId)
        {
            try
            {
                var observations = _observationRepo.GetByClientId(clientId);

                var result = observations.Select(o => new ClinicalObservationDto
                {
                    Id = o.Id,
                    Gender = o.Gender,
                    Age = o.Age,
                    Height = o.Height,
                    Weight = o.Weight,
                    BloodPressure = o.BloodPressure,
                    HeartRate = o.HeartRate,
                    Notes = o.Notes,
                    ObservationDate = o.ObservationDate,
                    Client = new ClientBasicDto
                    {
                        UserName = o.Client.UserName,
                        FirstName = o.Client.FirstName,
                        LastName = o.Client.LastName
                    },
                    RecordedByDoctor = new DoctorBasicDto
                    {
                        UserName = o.RecordedByDoctor.UserName,
                        FirstName = o.RecordedByDoctor.FirstName,
                        LastName = o.RecordedByDoctor.LastName,
                        Specialization = o.RecordedByDoctor.Specialization
                    },
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt
                }).ToList();

                return Ok(new ApiResponseDto<List<ClinicalObservationDto>>
                {
                    Success = true,
                    Data = result,
                    Message = "Client clinical observations retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving client clinical observations",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get clinical observations recorded by a specific doctor (Doctor, Admin)
        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Doctor,Admin")]
        public IActionResult GetDoctorObservations(int doctorId)
        {
            try
            {
                var observations = _observationRepo.GetByDoctorId(doctorId);

                var result = observations.Select(o => new ClinicalObservationDto
                {
                    Id = o.Id,
                    Gender = o.Gender,
                    Age = o.Age,
                    Height = o.Height,
                    Weight = o.Weight,
                    BloodPressure = o.BloodPressure,
                    HeartRate = o.HeartRate,
                    Notes = o.Notes,
                    ObservationDate = o.ObservationDate,
                    Client = new ClientBasicDto
                    {
                        UserName = o.Client.UserName,
                        FirstName = o.Client.FirstName,
                        LastName = o.Client.LastName
                    },
                    RecordedByDoctor = new DoctorBasicDto
                    {
                        UserName = o.RecordedByDoctor.UserName,
                        FirstName = o.RecordedByDoctor.FirstName,
                        LastName = o.RecordedByDoctor.LastName,
                        Specialization = o.RecordedByDoctor.Specialization
                    },
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt
                }).ToList();

                return Ok(new ApiResponseDto<List<ClinicalObservationDto>>
                {
                    Success = true,
                    Data = result,
                    Message = "Doctor clinical observations retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving doctor clinical observations",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get latest clinical observation for a client
        [HttpGet("client/{clientId}/latest")]
        [Authorize(Roles = "Client,Doctor,Admin")]
        public IActionResult GetLatestClientObservation(int clientId)
        {
            try
            {
                var observation = _observationRepo.GetLatestByClientId(clientId);
                if (observation == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "No clinical observations found for this client"
                    });
                }

                var result = new ClinicalObservationDto
                {
                    Id = observation.Id,
                    Gender = observation.Gender,
                    Age = observation.Age,
                    Height = observation.Height,
                    Weight = observation.Weight,
                    BloodPressure = observation.BloodPressure,
                    HeartRate = observation.HeartRate,
                    Notes = observation.Notes,
                    ObservationDate = observation.ObservationDate,
                    Client = new ClientBasicDto
                    {
                        UserName = observation.Client.UserName,
                        FirstName = observation.Client.FirstName,
                        LastName = observation.Client.LastName
                    },
                    RecordedByDoctor = new DoctorBasicDto
                    {
                        UserName = observation.RecordedByDoctor.UserName,
                        FirstName = observation.RecordedByDoctor.FirstName,
                        LastName = observation.RecordedByDoctor.LastName,
                        Specialization = observation.RecordedByDoctor.Specialization
                    },
                    CreatedAt = observation.CreatedAt,
                    UpdatedAt = observation.UpdatedAt
                };

                return Ok(new ApiResponseDto<ClinicalObservationDto>
                {
                    Success = true,
                    Data = result,
                    Message = "Latest clinical observation retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving latest clinical observation",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Update clinical observation (Doctor only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Doctor")]
        public IActionResult UpdateObservation(int id, [FromBody] ClinicalObservationUpdateDto request)
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

                var observation = _observationRepo.GetById(id);
                if (observation == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Clinical observation not found"
                    });
                }

                // Update properties if provided
                if (!string.IsNullOrEmpty(request.Gender))
                    observation.Gender = request.Gender;

                if (request.Age.HasValue)
                    observation.Age = request.Age.Value;

                if (request.Height.HasValue)
                    observation.Height = request.Height.Value;

                if (request.Weight.HasValue)
                    observation.Weight = request.Weight.Value;

                if (!string.IsNullOrEmpty(request.BloodPressure))
                    observation.BloodPressure = request.BloodPressure;

                if (request.HeartRate.HasValue)
                    observation.HeartRate = request.HeartRate.Value;

                if (request.Notes != null)
                    observation.Notes = request.Notes;

                if (request.ObservationDate.HasValue)
                    observation.ObservationDate = request.ObservationDate.Value;

                _observationRepo.Update(observation);
                _observationRepo.Save();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Clinical observation updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating clinical observation",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Delete clinical observation (Doctor only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Doctor")]
        public IActionResult DeleteObservation(int id)
        {
            try
            {
                var observation = _observationRepo.GetById(id);
                if (observation == null)
                {
                    return NotFound(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Clinical observation not found"
                    });
                }

                _observationRepo.Delete(observation);
                _observationRepo.Save();

                return Ok(new ApiResponseDto
                {
                    Success = true,
                    Message = "Clinical observation deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting clinical observation",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}