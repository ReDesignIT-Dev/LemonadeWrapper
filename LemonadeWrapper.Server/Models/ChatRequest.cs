namespace LemonadeWrapper.Server.Models
{
    public class ChatRequest
    {
        public string Content { get; set; } = string.Empty;
        public string AiServerUrl { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
    }
}
