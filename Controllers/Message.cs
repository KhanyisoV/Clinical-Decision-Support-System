using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FinalYearProject.Data;
using FinalYearProject.Models;
using FinalYearProject.DTOs;
using System.Security.Claims;

namespace FinalYearProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All users can access
    public class MessageController : ControllerBase
    {
        private readonly AppDbContext _db;

        public MessageController(AppDbContext db)
        {
            _db = db;
        }

        // Send a message
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] MessageCreateDto request)
        {
            try
            {
                var senderUsername = User.FindFirst(ClaimTypes.Name)?.Value;
                var senderRole = User.FindFirst(ClaimTypes.Role)?.Value;

                if (string.IsNullOrEmpty(senderUsername) || string.IsNullOrEmpty(senderRole))
                {
                    return Unauthorized(new ApiResponseDto
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                // Generate conversation ID (consistent regardless of who sends first)
                var conversationId = GenerateConversationId(
                    senderUsername, senderRole, 
                    request.ReceiverUsername, request.ReceiverRole
                );

                var message = new Message
                {
                    SenderUsername = senderUsername,
                    SenderRole = senderRole,
                    ReceiverUsername = request.ReceiverUsername,
                    ReceiverRole = request.ReceiverRole,
                    Content = request.Content,
                    ConversationId = conversationId,
                    SentAt = DateTime.UtcNow
                };

                _db.Messages.Add(message);
                await _db.SaveChangesAsync();

                return Ok(new ApiResponseDto<MessageDto>
                {
                    Success = true,
                    Message = "Message sent successfully",
                    Data = await MapToMessageDto(message)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred while sending message",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get conversations for current user
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized();
                }

                var messages = await _db.Messages
                    .Where(m => m.SenderUsername == username || m.ReceiverUsername == username)
                    .OrderByDescending(m => m.SentAt)
                    .ToListAsync();

                var conversations = messages
                    .GroupBy(m => m.ConversationId)
                    .Select(g =>
                    {
                        var lastMessage = g.First();
                        var otherUsername = lastMessage.SenderUsername == username 
                            ? lastMessage.ReceiverUsername 
                            : lastMessage.SenderUsername;
                        var otherRole = lastMessage.SenderUsername == username 
                            ? lastMessage.ReceiverRole 
                            : lastMessage.SenderRole;

                        return new ConversationDto
                        {
                            ConversationId = g.Key ?? "",
                            OtherUserUsername = otherUsername,
                            OtherUserRole = otherRole,
                            OtherUserFullName = GetUserFullName(otherUsername, otherRole),
                            LastMessage = lastMessage.Content,
                            LastMessageTime = lastMessage.SentAt,
                            UnreadCount = g.Count(m => !m.IsRead && m.ReceiverUsername == username)
                        };
                    })
                    .ToList();

                return Ok(new ApiResponseDto<List<ConversationDto>>
                {
                    Success = true,
                    Data = conversations,
                    Message = "Conversations retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get messages in a conversation
        [HttpGet("conversation/{otherUsername}")]
        public async Task<IActionResult> GetConversationMessages(string otherUsername, [FromQuery] string otherRole)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized();
                }

                var conversationId = GenerateConversationId(username, role!, otherUsername, otherRole);

                var messages = await _db.Messages
                    .Where(m => m.ConversationId == conversationId)
                    .OrderBy(m => m.SentAt)
                    .ToListAsync();

                // Mark messages as read
                var unreadMessages = messages.Where(m => 
                    m.ReceiverUsername == username && !m.IsRead).ToList();
                
                foreach (var msg in unreadMessages)
                {
                    msg.IsRead = true;
                    msg.ReadAt = DateTime.UtcNow;
                }

                if (unreadMessages.Any())
                {
                    await _db.SaveChangesAsync();
                }

                var messageDtos = new List<MessageDto>();
                foreach (var msg in messages)
                {
                    messageDtos.Add(await MapToMessageDto(msg));
                }

                return Ok(new ApiResponseDto<List<MessageDto>>
                {
                    Success = true,
                    Data = messageDtos,
                    Message = "Messages retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Get unread message count
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized();
                }

                var count = await _db.Messages
                    .CountAsync(m => m.ReceiverUsername == username && !m.IsRead);

                return Ok(new ApiResponseDto<int>
                {
                    Success = true,
                    Data = count,
                    Message = "Unread count retrieved"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponseDto
                {
                    Success = false,
                    Message = "An error occurred",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // Helper methods
        private string GenerateConversationId(string user1, string role1, string user2, string role2)
        {
            var participants = new[] 
            { 
                $"{user1}_{role1}", 
                $"{user2}_{role2}" 
            }.OrderBy(x => x);
            
            return string.Join("_", participants);
        }

        private string GetUserFullName(string username, string role)
        {
            try
            {
                if (role == "Client")
                {
                    var client = _db.Clients.FirstOrDefault(c => c.UserName == username);
                    return $"{client?.FirstName} {client?.LastName}".Trim();
                }
                else if (role == "Doctor")
                {
                    var doctor = _db.Doctors.FirstOrDefault(d => d.UserName == username);
                    return $"{doctor?.FirstName} {doctor?.LastName}".Trim();
                }
                else if (role == "Admin")
                {
                    var admin = _db.Admins.FirstOrDefault(a => a.UserName == username);
                    return $"{admin?.FirstName} {admin?.LastName}".Trim();
                }
            }
            catch { }

            return username;
        }

        private async Task<MessageDto> MapToMessageDto(Message message)
        {
            return new MessageDto
            {
                Id = message.Id,
                SenderUsername = message.SenderUsername,
                SenderRole = message.SenderRole,
                SenderFullName = GetUserFullName(message.SenderUsername, message.SenderRole),
                ReceiverUsername = message.ReceiverUsername,
                ReceiverRole = message.ReceiverRole,
                ReceiverFullName = GetUserFullName(message.ReceiverUsername, message.ReceiverRole),
                Content = message.Content,
                IsRead = message.IsRead,
                SentAt = message.SentAt,
                ReadAt = message.ReadAt,
                ConversationId = message.ConversationId ?? ""
            };
        }
    }
}