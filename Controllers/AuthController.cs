using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using FinalYearProject.Data;
using FinalYearProject.Models;
using FinalYearProject.DTOs;
using FinalYearProject.Services;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<Admin> _adminHasher;
        private readonly IPasswordHasher<Client> _clientHasher;
        private readonly IPasswordHasher<Doctor> _doctorHasher;
        private readonly IConfiguration _config;

        public AuthController(
            AppDbContext db,
            IPasswordHasher<Admin> adminHasher,
            IPasswordHasher<Client> clientHasher,
            IPasswordHasher<Doctor> doctorHasher,
            IConfiguration config)
        {
            _db = db;
            _adminHasher = adminHasher;
            _clientHasher = clientHasher;
            _doctorHasher = doctorHasher;
            _config = config;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto request)
        {
            try
            {
                Console.WriteLine($"🔐 Login attempt for username: {request.UserName}");
                
                // Validate input using ModelState
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                        
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Invalid input data",
                        Errors = errors
                    });
                }

                IUser? user = null;

                // Try Admin
                Console.WriteLine("🔍 Checking Admin table...");
                var admin = _db.Admins.FirstOrDefault(a => a.UserName == request.UserName);
                if (admin != null)
                {
                    Console.WriteLine($"👤 Found admin user: {admin.UserName}");
                    var result = _adminHasher.VerifyHashedPassword(admin, admin.PasswordHash, request.Password);
                    Console.WriteLine($"🔑 Admin password verification: {result}");
                    
                    if (result == PasswordVerificationResult.Success)
                    {
                        user = admin;
                        Console.WriteLine("✅ Admin login successful");
                    }
                }

                // Try Client
                if (user == null)
                {
                    Console.WriteLine("🔍 Checking Client table...");
                    var client = _db.Clients.FirstOrDefault(c => c.UserName == request.UserName);
                    if (client != null)
                    {
                        Console.WriteLine($"👤 Found client user: {client.UserName}");
                        var result = _clientHasher.VerifyHashedPassword(client, client.PasswordHash, request.Password);
                        Console.WriteLine($"🔑 Client password verification: {result}");
                        
                        if (result == PasswordVerificationResult.Success)
                        {
                            user = client;
                            Console.WriteLine("✅ Client login successful");
                        }
                    }
                }

                // Try Doctor
                if (user == null)
                {
                    Console.WriteLine("🔍 Checking Doctor table...");
                    var doctor = _db.Doctors.FirstOrDefault(d => d.UserName == request.UserName);
                    if (doctor != null)
                    {
                        Console.WriteLine($"👤 Found doctor user: {doctor.UserName}");
                        var result = _doctorHasher.VerifyHashedPassword(doctor, doctor.PasswordHash, request.Password);
                        Console.WriteLine($"🔑 Doctor password verification: {result}");
                        
                        if (result == PasswordVerificationResult.Success)
                        {
                            user = doctor;
                            Console.WriteLine("✅ Doctor login successful");
                        }
                    }
                }

                if (user == null)
                {
                    Console.WriteLine("❌ User not found or password mismatch");
                    
                    // Debug: Check if user exists at all
                    var adminExists = _db.Admins.Any(a => a.UserName == request.UserName);
                    var clientExists = _db.Clients.Any(c => c.UserName == request.UserName);
                    var doctorExists = _db.Doctors.Any(d => d.UserName == request.UserName);
                    
                    Console.WriteLine($"Debug - User exists in: Admin={adminExists}, Client={clientExists}, Doctor={doctorExists}");
                    
                    return Unauthorized(new ApiResponseDto
                    {
                        Success = false,
                        Message = "Invalid username or password",
                        Errors = new List<string> { "Authentication failed" }
                    });
                }

                Console.WriteLine($"🎫 Generating JWT token for user: {user.UserName}, Role: {user.Role}");
                
                var token = GenerateJwtToken(user);
                
                if (string.IsNullOrEmpty(token))
                {
                    Console.WriteLine("❌ Token generation failed");
                    return StatusCode(500, new ApiResponseDto
                    {
                        Success = false,
                        Message = "Token generation failed",
                        Errors = new List<string> { "Internal server error during token generation" }
                    });
                }
                
                var response = new LoginResponseDto
                { 
                    Token = token, 
                    Role = user.Role,
                    UserName = user.UserName,
                    Success = true
                };
                
                Console.WriteLine($"✅ Login successful for {user.UserName}");
                
                return Ok(new ApiResponseDto<LoginResponseDto>
                {
                    Success = true,
                    Message = "Login successful",
                    Data = response
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Login exception: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred during login",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        private string GenerateJwtToken(IUser user)
        {
            try
            {
                // Check JWT configuration
                var jwtKey = _config["Jwt:Key"];
                var jwtIssuer = _config["Jwt:Issuer"];
                var jwtAudience = _config["Jwt:Audience"];
                var jwtExpiryMinutes = _config["Jwt:ExpiryMinutes"];
                
                Console.WriteLine($"JWT Config - Key: {(string.IsNullOrEmpty(jwtKey) ? "MISSING" : "Present")}, Issuer: {jwtIssuer}, Audience: {jwtAudience}, Expiry: {jwtExpiryMinutes}");
                
                if (string.IsNullOrEmpty(jwtKey))
                {
                    throw new InvalidOperationException("JWT Key is not configured");
                }

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };

                var expiryMinutes = string.IsNullOrEmpty(jwtExpiryMinutes) ? 60 : Convert.ToDouble(jwtExpiryMinutes);

                var token = new JwtSecurityToken(
                    issuer: jwtIssuer,
                    audience: jwtAudience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                    signingCredentials: creds
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
                Console.WriteLine($"🎫 Generated token: {tokenString.Substring(0, Math.Min(50, tokenString.Length))}...");
                
                return tokenString;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ JWT generation error: {ex.Message}");
                throw;
            }
        }

        // Add a test endpoint to check if controller is working
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new ApiResponseDto<object>
            {
                Success = true,
                Message = "Auth controller is working!",
                Data = new
                {
                    timestamp = DateTime.Now,
                    dbConnected = _db.Database.CanConnect()
                }
            });
        }

        // Add endpoint to check users in database (for debugging - remove in production)
        [HttpGet("debug/users")]
        public IActionResult DebugUsers()
        {
            try
            {
                var adminCount = _db.Admins.Count();
                var clientCount = _db.Clients.Count();
                var doctorCount = _db.Doctors.Count();
                
                var adminUsernames = _db.Admins.Take(5).Select(a => a.UserName).ToList();
                var clientUsernames = _db.Clients.Take(5).Select(c => c.UserName).ToList();
                var doctorUsernames = _db.Doctors.Take(5).Select(d => d.UserName).ToList();

                return Ok(new ApiResponseDto<object>
                {
                    Success = true,
                    Message = "Debug information retrieved successfully",
                    Data = new
                    {
                        AdminCount = adminCount,
                        ClientCount = clientCount,
                        DoctorCount = doctorCount,
                        SampleAdminUsernames = adminUsernames,
                        SampleClientUsernames = clientUsernames,
                        SampleDoctorUsernames = doctorUsernames
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while retrieving debug information",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('✅ Restored user from storage:', userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('🔐 Login attempt with:', credentials);
      
      // Call the actual login API endpoint
      const response = await authService.login(credentials);
      console.log('📊 API Response:', response);
      
      if (response.success && response.data) {
        const userData = {
          id: response.data.id,
          userName: response.data.userName,
          role: response.data.role,
          token: response.data.token,
          firstName: response.data.firstName,
          lastName: response.data.lastName
        };
        
        console.log('✅ Login successful, user data:', userData);
        
        // Store token and user data
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        
        return { success: true, data: userData };
      } else {
        console.log('❌ Login failed:', response.message);
        return { 
          success: false, 
          error: response.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};