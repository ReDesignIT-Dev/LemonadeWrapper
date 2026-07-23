using System.Text.Json.Serialization;

namespace LemonadeWrapper.Server.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public string Role { get; set; } = string.Empty;    // "user" or "assistant"
        public string Content { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public bool IsUserMessage { get; set; }
        public int ChatSessionId { get; set; }
        [JsonIgnore]
        public ChatSession? Session { get; set; }
    }
}