using LemonadeWrapper.Server.Context;
using LemonadeWrapper.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace LemonadeWrapper.Server.Services;

public class ChatMessageService : IChatMessageService
{
    private readonly ChatDbContext _context;

    public ChatMessageService(ChatDbContext context)
    {
        _context = context;
    }

    public async Task<ChatMessage> AddMessageAsync(int chatSessionId, string role, string content, bool isUserMessage)
    {
        var message = new ChatMessage
        {
            ChatSessionId = chatSessionId,
            Role = role,
            Content = content,
            IsUserMessage = isUserMessage,
            Timestamp = DateTime.UtcNow
        };

        _context.ChatMessages.Add(message);

        // Update session's last activity timestamp
        var session = await _context.ChatSessions.FindAsync(chatSessionId);
        if (session != null)
        {
            session.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return message;
    }

    public async Task<IEnumerable<ChatMessage>> GetMessagesAsync(int chatSessionId)
    {
        return await _context.ChatMessages
            .Where(m => m.ChatSessionId == chatSessionId)
            .OrderBy(m => m.Timestamp)
            .ToListAsync();
    }
}
