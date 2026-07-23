using LemonadeWrapper.Server.Context;
using LemonadeWrapper.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace LemonadeWrapper.Server.Services;

public class ChatSessionService : IChatSessionService
{
    private readonly ChatDbContext _context;

    public ChatSessionService(ChatDbContext context)
    {
        _context = context;
    }

    public async Task<ChatSession> CreateSessionAsync(string userId, string sessionId)
    {
        var session = new ChatSession
        {
            UserId = userId,
            SessionId = sessionId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ChatSessions.Add(session);
        await _context.SaveChangesAsync();

        return session;
    }

    public async Task<IEnumerable<ChatSession>> GetSessionsByUserIdAsync(string userId)
    {
        return await _context.ChatSessions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.UpdatedAt)
            .ToListAsync();
    }

    public async Task<ChatSession?> GetSessionAsync(string userId, string sessionId)
    {
        return await _context.ChatSessions
            .FirstOrDefaultAsync(s => s.UserId == userId && s.SessionId == sessionId);
    }

    public async Task DeleteSessionAsync(string sessionId)
    {
        var session = await _context.ChatSessions
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);
        if (session != null)
        {
            _context.ChatSessions.Remove(session);
            await _context.SaveChangesAsync();
        }
    }
}
