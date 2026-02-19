using System.Security.Claims;
using System.Text;
using FinalYearProject.Data;
using FinalYearProject.Models;
using FinalYearProject.Repositories;
using FinalYearProject.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// PasswordHasher
builder.Services.AddSingleton<IPasswordHasher<Admin>, PasswordHasher<Admin>>();
builder.Services.AddSingleton<IPasswordHasher<Client>, PasswordHasher<Client>>();
builder.Services.AddSingleton<IPasswordHasher<Doctor>, PasswordHasher<Doctor>>();

// Repository
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IDoctorRepository, DoctorRepository>();
builder.Services.AddScoped<ISymptomRepository, SymptomRepository>();
builder.Services.AddScoped<IDiagnosisRepository, DiagnosisRepository>();
builder.Services.AddScoped<IClinicalObservationRepository, ClinicalObservationRepository>();
builder.Services.AddScoped<IRecommendationRepository, RecommendationRepository>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();
builder.Services.AddScoped<IAppointmentHistoryRepository, AppointmentHistoryRepository>();
builder.Services.AddScoped<ITreatmentRepository, TreatmentRepository>();
builder.Services.AddScoped<IProgressRepository, ProgressRepository>();
builder.Services.AddScoped<ILabResultRepository, LabResultRepository>();
builder.Services.AddScoped<IAllergyRepository, AllergyRepository>();
builder.Services.AddScoped<IMLPredictionRepository, MLPredictionRepository>();
builder.Services.AddScoped<IPredictionHistoryRepository, PredictionHistoryRepository>();

builder.Services.AddScoped<IClientHistoryService, ClientHistoryService>();

// DTO's
builder.Services.AddScoped<IMappingService, MappingService>();

// Add HttpClient for ML predictions
builder.Services.AddHttpClient();

// JWT
var jwtSection = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSection["Audience"],
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuerSigningKey = true,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role,
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "CDSS API", Version = "v1" });

    // Add JWT Authentication
    c.AddSecurityDefinition(
        "Bearer",
        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description =
                "Enter 'Bearer' [space] and then your valid token in the text input below.\nExample: \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"",
        }
    );

    c.AddSecurityRequirement(
        new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference = new Microsoft.OpenApi.Models.OpenApiReference
                    {
                        Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                        Id = "Bearer",
                    },
                },
                new string[] { }
            },
        }
    );
});

app.UseRouting();  

// CORS - Allow all for now (you can restrict later)
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
    );
});

var app = builder.Build();

// Always enable Swagger (even in production for Koyeb)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CDSS API v1");
    c.RoutePrefix = "swagger"; // Access at /swagger
});

app.UseCors("AllowAll");

// NO HTTPS redirection for Koyeb
// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

// Health check endpoint
app.MapGet(
    "/",
    () =>
        Results.Ok(
            new
            {
                message = "CDSS API is running",
                version = "1.0",
                timestamp = DateTime.UtcNow,
            }
        )
);

app.MapGet(
    "/health",
    () =>
        Results.Ok(
            new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                database = "connected",
            }
        )
);

app.MapControllers();

// Seed default users (Admin, Doctor, Client)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    // Seed Admin
    if (!db.Admins.Any())
    {
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<Admin>>();
        var admin = new Admin { UserName = "admin", Role = "Admin" };
        admin.PasswordHash = hasher.HashPassword(admin, "Admin@123");
        db.Admins.Add(admin);
        db.SaveChanges();
    }

    // Seed Doctor
    if (!db.Doctors.Any())
    {
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<Doctor>>();
        var doctor = new Doctor
        {
            UserName = "doctor",
            Role = "doctor",
            FirstName = "Default",
            LastName = "Doctor",
            Email = "doctor@example.com"
        };
        doctor.PasswordHash = hasher.HashPassword(doctor, "Doctor@123");
        db.Doctors.Add(doctor);
        db.SaveChanges();
    }

    // Seed Client
    if (!db.Clients.Any())
    {
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<Client>>();
        var client = new Client
        {
            UserName = "client",
            Role = "client",
            FirstName = "Default",
            LastName = "Client",
            Email = "client@example.com"
        };
        client.PasswordHash = hasher.HashPassword(client, "Client@123");
        db.Clients.Add(client);
        db.SaveChanges();
    }
}

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");

