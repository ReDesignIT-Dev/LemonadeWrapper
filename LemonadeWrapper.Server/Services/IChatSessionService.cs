using LemonadeWrapper.Server.Models;

namespace LemonadeWrapper.Server.Services;

public interface IChatSessionService
{
    Task<ChatSession> CreateSessionAsync(string userId, string sessionId);
    Task<IEnumerable<ChatSession>> GetSessionsByUserIdAsync(string userId);
    Task<ChatSession?> GetSessionAsync(string userId, string sessionId);
    Task DeleteSessionAsync(string sessionId);
}
