using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.Infrastructure.Repositories;

public class AiRepository
{
    private readonly AgroLinkDbContext _db;

    public AiRepository(AgroLinkDbContext db) => _db = db;

    public async Task<AiSession?> GetSessionAsync(Guid sessionId, Guid userId) =>
        await _db.AiSessions
            .Include(s => s.AiMessages)
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

    public async Task<AiSession> CreateSessionAsync(Guid userId, string title)
    {
        var session = new AiSession { UserId = userId, Title = title };
        _db.AiSessions.Add(session);
        return session;
    }

    public async Task AddMessageAsync(AiMessage message) =>
        await _db.AiMessages.AddAsync(message);

    public async Task<List<AiSession>> GetUserSessionsAsync(Guid userId) =>
        await _db.AiSessions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.UpdatedAt)
            .ToListAsync();

    public async Task<List<AiMessage>> GetSessionMessagesAsync(Guid sessionId, Guid userId) =>
        await _db.AiMessages
            .Where(m => m.AiSession.Id == sessionId && m.AiSession.UserId == userId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();

    public async Task<bool> DeleteSessionAsync(Guid sessionId, Guid userId)
    {
        var session = await _db.AiSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);
        if (session == null) return false;
        _db.AiSessions.Remove(session);
        return true;
    }

    public async Task SaveChangesAsync() => await _db.SaveChangesAsync();
}