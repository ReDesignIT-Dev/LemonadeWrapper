namespace LemonadeWrapper.Server.Models
{
    public class AddMessageRequest
    {
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsUserMessage { get; set; }
    }
}