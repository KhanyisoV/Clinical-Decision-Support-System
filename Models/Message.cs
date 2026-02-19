using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalYearProject.Models
{
    public class Message
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string SenderUsername { get; set; } = string.Empty;

        [Required]
        public string SenderRole { get; set; } = string.Empty; // "Client", "Doctor", or "Admin"

        [Required]
        public string ReceiverUsername { get; set; } = string.Empty;

        [Required]
        public string ReceiverRole { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReadAt { get; set; }

        // Optional: For grouping messages into conversations
        public string? ConversationId { get; set; }
    }
}