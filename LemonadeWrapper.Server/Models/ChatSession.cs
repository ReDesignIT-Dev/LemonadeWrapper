using System.Text.Json.Serialization;

namespace LemonadeWrapper.Server.Models
{
    public class ChatSession
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation property
        [JsonIgnore]
        public List<ChatMessage> Messages { get; set; } = new();
    }
}