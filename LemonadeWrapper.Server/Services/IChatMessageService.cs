using LemonadeWrapper.Server.Models;

namespace LemonadeWrapper.Server.Services;

public interface IChatMessageService
{
    Task<ChatMessage> AddMessageAsync(int chatSessionId, string role, string content, bool isUserMessage);
    Task<IEnumerable<ChatMessage>> GetMessagesAsync(int chatSessionId);
}
