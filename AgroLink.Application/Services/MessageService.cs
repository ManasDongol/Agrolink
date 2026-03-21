

using AgroLink.Application.DTOs;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using AgroLink.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using UserConversationDto = AgroLink.Infrastructure.repoDTO.UserConversationDto;

namespace AgroLink.Application.Services;

public class MessageService(MessagesRepo repo,AgroLinkDbContext _dbContext)
{
    public async Task<List<UserConversationDto>> GetUserConversations(Guid userId)
    {
       /* var conversations = await _dbContext.Conversations
            .Where(c => c.User1Id == userId || c.User2Id == userId)
            .Select(c => new UserConversationDto {
                Id = c.Id,
                User1Id = c.User1Id,
                User2Id = c.User2Id,
                CreatedAt = c.CreatedAt,
                Messages = c.Messages.Select(m => new MessageDto {
                    MessageId = m.MessageId,
                    Content = m.Content,
                    SenderId = m.SenderId,
                    Sent = m.Sent
                }).ToList()
            }).ToListAsync();*/
       var conversations = await repo.GetUserConversations(userId);

        return conversations;
    }
    
   

    public async Task<List<Message>> GetMessages(Guid conversationId)
    {
        return await repo.GetMessages(conversationId);
    }

    public async Task<Message> SendMessage(string senderId, string conversationId, string content)
    {
        var message = new Message
        {
            MessageId = Guid.NewGuid(),
            SenderId = Guid.Parse(senderId),
            ConversationId = Guid.Parse(conversationId),
            Content = content,
            Sent = DateTime.UtcNow
        };

        return await repo.AddMessage(message);
    }
    
    public async Task<ConversationDto> CreateConversation(Guid user1Id, Guid user2Id)
    {
        // Check if conversation already exists
        var existing = await _dbContext.Conversations
            .FirstOrDefaultAsync(c =>
                (c.User1Id == user1Id && c.User2Id == user2Id) ||
                (c.User1Id == user2Id && c.User2Id == user1Id));

        if (existing != null)
            return new ConversationDto
            {
              
                User1Id = existing.User1Id,
                User2Id = existing.User2Id
            };

        // Create new conversation
        var conv = new Conversation
        {
            Id = Guid.NewGuid(),
            User1Id = user1Id,
            User2Id = user2Id
        };

        _dbContext.Conversations.Add(conv);
        await _dbContext.SaveChangesAsync();

        return new ConversationDto
        {
           
            User1Id = conv.User1Id,
            User2Id = conv.User2Id
        };
    }

    public async Task<List<ConnectionDto>> GetConnections(Guid userId)
    {
        return await _dbContext.Connections
            .Where(c => c.UserID == userId || c.ConnectionUserId == userId)
            .Include(c => c.User)
            .ThenInclude(u => u.Profile)
            .Include(c => c.ConnectionUser)
            .ThenInclude(u => u.Profile)
            .Select(c => new ConnectionDto
            {
                Id = c.UserID == userId ? c.ConnectionUserId : c.UserID,
                Name = c.UserID == userId 
                    ? c.ConnectionUser.Username 
                    : c.User.Username,
                ProfileImage = c.UserID == userId
                    ? c.ConnectionUser.Profile.ProfilePicture
                    : c.User.Profile.ProfilePicture
            })
            .ToListAsync();
    }
}