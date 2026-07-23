namespace LemonadeWrapper.Server.Models
{
    public class CreateSessionRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
    }
}