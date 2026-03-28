using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using AgroLink.Infrastructure.repoDTO;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.Infrastructure.Repositories;

public class MessagesRepo(AgroLinkDbContext _dbContext)
{
    public async Task<List<UserConversationDto>> GetUserConversations(Guid currentUserId)
    {
        return await _dbContext.Conversations
            .Where(c => c.User1Id == currentUserId || c.User2Id == currentUserId)
            .OrderByDescending(c => c.Messages               // ← sort convs by last message
                .Max(m => (DateTime?)m.Sent) ?? c.CreatedAt)
            .Select(c => new UserConversationDto
            {
                Id = c.Id,
                // Determine the "other user"
                PartnerId = c.User1Id == currentUserId ? c.User2Id : c.User1Id,
                PartnerName = c.User1Id == currentUserId ? c.User2.Username : c.User1.Username,
                PartnerProfile = c.User1Id == currentUserId ? c.User2.Profile.ProfilePicture : c.User1.Profile.ProfilePicture,
                LastMessage = c.Messages
                    .OrderByDescending(m => m.Sent)
                    .Select(m => new MessageDto
                    {
                        MessageId = m.MessageId,
                        Content = m.Content,
                        Sent = m.Sent
                    })
                    .FirstOrDefault()
            })
            .ToListAsync();
    }

    public async Task<List<Message>> GetMessages(Guid conversationId, int pageSize = 10)
    {
        return await _dbContext.Messages
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.Sent)
            .Take(pageSize)
            .OrderBy(m => m.Sent) // reverse for UI
            .ToListAsync();
    }

    public async Task<Message> AddMessage(Message message)
    {
        _dbContext.Messages.Add(message);
        await _dbContext.SaveChangesAsync();
        return message;
    }

    public async Task<Conversation?> GetConversation(Guid conversationId)
    {
        return await _dbContext.Conversations.FindAsync(conversationId);
    }

    public async Task<Conversation?> GetConversationBetweenUsers(Guid user1Id, Guid user2Id)
    {
        return await _dbContext.Conversations
            .FirstOrDefaultAsync(c =>
                (c.User1Id == user1Id && c.User2Id == user2Id) ||
                (c.User1Id == user2Id && c.User2Id == user1Id));
    }

    public async Task<List<Guid>> GetConnections(Guid userId)
    {
        return await _dbContext.Connections
        .Where(c => c.UserID == userId || c.ConnectionUserId == userId)
        .Select(c => c.UserID == userId ? c.ConnectionUserId : c.UserID)
        .ToListAsync();
    }
    
}