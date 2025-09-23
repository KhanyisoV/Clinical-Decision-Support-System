using FinalYearProject.Models;
using FinalYearProject.DTOs;

// Create this file as: Services/MappingService.cs in your project
namespace FinalYearProject.Services
{
    public interface IMappingService
    {
        // Admin mappings
        AdminDto ToAdminDto(Admin admin);
        Admin ToAdmin(AdminCreateDto dto);
        void UpdateAdmin(Admin admin, AdminUpdateDto dto);

        // Client mappings
        ClientDto ToClientDto(Client client);
        ClientBasicDto ToClientBasicDto(Client client);
        Client ToClient(ClientCreateDto dto);
        void UpdateClient(Client client, ClientUpdateDto dto);

        // Doctor mappings
        DoctorDto ToDoctorDto(Doctor doctor);
        DoctorBasicDto ToDoctorBasicDto(Doctor doctor);
        Doctor ToDoctor(DoctorCreateDto dto);
        void UpdateDoctor(Doctor doctor, DoctorUpdateDto dto);

        // Symptom mappings
        SymptomDto ToSymptomDto(Symptom symptom);
        Symptom ToSymptom(SymptomCreateDto dto);
        void UpdateSymptom(Symptom symptom, SymptomUpdateDto dto);

        // Diagnosis mappings
        DiagnosisDto ToDiagnosisDto(Diagnosis diagnosis);
        Diagnosis ToDiagnosis(DiagnosisCreateDto dto);
        void UpdateDiagnosis(Diagnosis diagnosis, DiagnosisUpdateDto dto);
    }

    public class MappingService : IMappingService
    {
        // Admin mappings
        public AdminDto ToAdminDto(Admin admin)
        {
            return new AdminDto
            {
                UserName = admin.UserName,
                Role = admin.Role,
                FirstName = admin.FirstName,
                LastName = admin.LastName,
                Email = admin.Email,
                CreatedAt = admin.CreatedAt,
                UpdatedAt = admin.UpdatedAt
            };
        }

        public Admin ToAdmin(AdminCreateDto dto)
        {
            return new Admin
            {
                UserName = dto.UserName,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Role = "Admin"
            };
        }

        public void UpdateAdmin(Admin admin, AdminUpdateDto dto)
        {
            if (!string.IsNullOrEmpty(dto.UserName))
                admin.UserName = dto.UserName;
            
            if (!string.IsNullOrEmpty(dto.FirstName))
                admin.FirstName = dto.FirstName;
            
            if (!string.IsNullOrEmpty(dto.LastName))
                admin.LastName = dto.LastName;
            
            if (!string.IsNullOrEmpty(dto.Email))
                admin.Email = dto.Email;

            admin.UpdatedAt = DateTime.UtcNow;
        }

        // Client mappings
        public ClientDto ToClientDto(Client client)
        {
            return new ClientDto
            {
                UserName = client.UserName,
                Role = client.Role,
                FirstName = client.FirstName,
                LastName = client.LastName,
                Email = client.Email,
                DateOfBirth = client.DateOfBirth,
                AssignedDoctor = client.AssignedDoctor != null ? ToDoctorBasicDto(client.AssignedDoctor) : null,
                CreatedAt = client.CreatedAt,
                UpdatedAt = client.UpdatedAt
            };
        }

        public ClientBasicDto ToClientBasicDto(Client client)
        {
            return new ClientBasicDto
            {
                UserName = client.UserName,
                FirstName = client.FirstName,
                LastName = client.LastName
            };
        }

        public Client ToClient(ClientCreateDto dto)
        {
            return new Client
            {
                UserName = dto.UserName,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                DateOfBirth = dto.DateOfBirth,
                AssignedDoctorId = dto.AssignedDoctorId,
                Role = "Client"
            };
        }

        public void UpdateClient(Client client, ClientUpdateDto dto)
        {
            if (!string.IsNullOrEmpty(dto.UserName))
                client.UserName = dto.UserName;
            
            if (!string.IsNullOrEmpty(dto.FirstName))
                client.FirstName = dto.FirstName;
            
            if (!string.IsNullOrEmpty(dto.LastName))
                client.LastName = dto.LastName;
            
            if (!string.IsNullOrEmpty(dto.Email))
                client.Email = dto.Email;
            
            if (dto.DateOfBirth.HasValue)
                client.DateOfBirth = dto.DateOfBirth;
            
            if (dto.AssignedDoctorId.HasValue)
                client.AssignedDoctorId = dto.AssignedDoctorId;

            client.UpdatedAt = DateTime.UtcNow;
        }

        // Doctor mappings
        public DoctorDto ToDoctorDto(Doctor doctor)
        {
            return new DoctorDto
            {
                UserName = doctor.UserName,
                Role = doctor.Role,
                FirstName = doctor.FirstName,
                LastName = doctor.LastName,
                Email = doctor.Email,
                Specialization = doctor.Specialization,
                LicenseNumber = doctor.LicenseNumber,
                CreatedAt = doctor.CreatedAt,
                UpdatedAt = doctor.UpdatedAt
            };
        }

        public DoctorBasicDto ToDoctorBasicDto(Doctor doctor)
        {
            return new DoctorBasicDto
            {
                UserName = doctor.UserName,
                FirstName = doctor.FirstName,
                LastName = doctor.LastName,
                Specialization = doctor.Specialization
            };
        }

        public Doctor ToDoctor(DoctorCreateDto dto)
        {
            return new Doctor
            {
                UserName = dto.UserName,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Specialization = dto.Specialization,
                LicenseNumber = dto.LicenseNumber,
                Role = "Doctor"
            };
        }

        public void UpdateDoctor(Doctor doctor, DoctorUpdateDto dto)
        {
            if (!string.IsNullOrEmpty(dto.UserName))
                doctor.UserName = dto.UserName;
            
            if (!string.IsNullOrEmpty(dto.FirstName))
                doctor.FirstName = dto.FirstName;
            
            if (!string.IsNullOrEmpty(dto.LastName))
                doctor.LastName = dto.LastName;
            
            if (!string.IsNullOrEmpty(dto.Email))
                doctor.Email = dto.Email;
            
            if (!string.IsNullOrEmpty(dto.Specialization))
                doctor.Specialization = dto.Specialization;
            
            if (!string.IsNullOrEmpty(dto.LicenseNumber))
                doctor.LicenseNumber = dto.LicenseNumber;

            doctor.UpdatedAt = DateTime.UtcNow;
        }

        // Symptom mappings
        public SymptomDto ToSymptomDto(Symptom symptom)
        {
            return new SymptomDto
            {
                Name = symptom.Name,
                Description = symptom.Description,
                SeverityLevel = symptom.SeverityLevel,
                DateReported = symptom.DateReported,
                DateResolved = symptom.DateResolved,
                IsActive = symptom.IsActive,
                Notes = symptom.Notes,
                Client = ToClientBasicDto(symptom.Client),
                AddedByDoctor = ToDoctorBasicDto(symptom.AddedByDoctor),
                CreatedAt = symptom.CreatedAt,
                UpdatedAt = symptom.UpdatedAt
            };
        }

        public Symptom ToSymptom(SymptomCreateDto dto)
        {
            return new Symptom
            {
                Name = dto.Name,
                Description = dto.Description,
                SeverityLevel = dto.SeverityLevel,
                Notes = dto.Notes,
                ClientId = dto.ClientId,
                AddedByDoctorId = dto.AddedByDoctorId
            };
        }

        public void UpdateSymptom(Symptom symptom, SymptomUpdateDto dto)
        {
            if (!string.IsNullOrEmpty(dto.Name))
                symptom.Name = dto.Name;
            
            if (!string.IsNullOrEmpty(dto.Description))
                symptom.Description = dto.Description;
            
            if (dto.SeverityLevel.HasValue)
                symptom.SeverityLevel = dto.SeverityLevel.Value;
            
            if (dto.DateResolved.HasValue)
                symptom.DateResolved = dto.DateResolved;
            
            if (dto.IsActive.HasValue)
                symptom.IsActive = dto.IsActive.Value;
            
            if (!string.IsNullOrEmpty(dto.Notes))
                symptom.Notes = dto.Notes;

            symptom.UpdatedAt = DateTime.UtcNow;
        }

        // Diagnosis mappings
        public DiagnosisDto ToDiagnosisDto(Diagnosis diagnosis)
        {
            return new DiagnosisDto
            {
                Title = diagnosis.Title,
                Description = diagnosis.Description,
                DiagnosisCode = diagnosis.DiagnosisCode,
                Severity = diagnosis.Severity,
                Status = diagnosis.Status,
                TreatmentPlan = diagnosis.TreatmentPlan,
                Notes = diagnosis.Notes,
                DateDiagnosed = diagnosis.DateDiagnosed,
                DateResolved = diagnosis.DateResolved,
                IsActive = diagnosis.IsActive,
                Client = ToClientBasicDto(diagnosis.Client),
                DiagnosedByDoctor = ToDoctorBasicDto(diagnosis.DiagnosedByDoctor),
                CreatedAt = diagnosis.CreatedAt,
                UpdatedAt = diagnosis.UpdatedAt
            };
        }

        public Diagnosis ToDiagnosis(DiagnosisCreateDto dto)
        {
            return new Diagnosis
            {
                Title = dto.Title,
                Description = dto.Description,
                DiagnosisCode = dto.DiagnosisCode,
                Severity = dto.Severity,
                Status = dto.Status,
                TreatmentPlan = dto.TreatmentPlan,
                Notes = dto.Notes,
                ClientId = dto.ClientId,
                DiagnosedByDoctorId = dto.DiagnosedByDoctorId
            };
        }

        public void UpdateDiagnosis(Diagnosis diagnosis, DiagnosisUpdateDto dto)
        {
            if (!string.IsNullOrEmpty(dto.Title))
                diagnosis.Title = dto.Title;
            
            if (!string.IsNullOrEmpty(dto.Description))
                diagnosis.Description = dto.Description;
            
            if (!string.IsNullOrEmpty(dto.DiagnosisCode))
                diagnosis.DiagnosisCode = dto.DiagnosisCode;
            
            if (dto.Severity.HasValue)
                diagnosis.Severity = dto.Severity.Value;
            
            if (!string.IsNullOrEmpty(dto.Status))
                diagnosis.Status = dto.Status;
            
            if (!string.IsNullOrEmpty(dto.TreatmentPlan))
                diagnosis.TreatmentPlan = dto.TreatmentPlan;
            
            if (!string.IsNullOrEmpty(dto.Notes))
                diagnosis.Notes = dto.Notes;
            
            if (dto.IsActive.HasValue)
                diagnosis.IsActive = dto.IsActive.Value;
            
            if (dto.DateResolved.HasValue)
                diagnosis.DateResolved = dto.DateResolved;

            diagnosis.UpdatedAt = DateTime.UtcNow;
        }
    }
}