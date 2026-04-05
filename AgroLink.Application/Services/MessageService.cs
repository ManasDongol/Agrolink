

using System.Security.Claims;
using AgroLink.Application.DTOs;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using AgroLink.Infrastructure.Repositories;
using Microsoft.AspNetCore.Http;
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
    
   

    public async Task<List<MessageDto>> GetMessages(Guid conversationId)
    {
        var messages = await repo.GetMessages(conversationId);

        return messages.Select(m => new MessageDto
        {
            MessageId = m.MessageId,
            ConversationId = m.ConversationId,
            SenderId = m.SenderId,
            Sent = m.Sent,
            IsImage = m.HasAttachment,
            // if it's an image, content = the path; otherwise normal text content
            Content = m.HasAttachment ? m.AttachmentPath : m.Content
        }).ToList();
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

        // ← sync the conversation entity fields
        var conversation = await _dbContext.Conversations.FindAsync(Guid.Parse(conversationId));
        if (conversation != null)
        {
            conversation.LastMessage = content;
            conversation.LastMessageTime = DateTime.UtcNow;
        }

        return await repo.AddMessage(message);  // SaveChangesAsync inside here saves both
    }
    
    public async Task<UserConversationDto> CreateConversation(Guid currentUserId, Guid user1Id, Guid user2Id)
    {
        // Figure out who the partner is
        Guid otherUserId = currentUserId == user1Id ? user2Id : user1Id;

        // Check if conversation already exists
        var existing = await _dbContext.Conversations
            .FirstOrDefaultAsync(c =>
                (c.User1Id == user1Id && c.User2Id == user2Id) ||
                (c.User1Id == user2Id && c.User2Id == user1Id));

        Guid conversationId;

        if (existing != null)
        {
            conversationId = existing.Id;
        }
        else
        {
            var conv = new Conversation
            {
                Id = Guid.NewGuid(),
                User1Id = user1Id,
                User2Id = user2Id
            };
            _dbContext.Conversations.Add(conv);
            await _dbContext.SaveChangesAsync();
            conversationId = conv.Id;
        }

        // Fetch partner details
        var partner = await _dbContext.Users
            .Where(u => u.UserId == otherUserId)
            .Select(u => new { u.Username, u.Profile.ProfilePicture })
            .FirstOrDefaultAsync();

        return new UserConversationDto
        {
            Id = conversationId,               // ← this is what Angular needs
            PartnerId = otherUserId,
            PartnerName = partner?.Username ?? string.Empty,
            PartnerProfile = partner?.ProfilePicture ?? string.Empty
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

    public async Task<string> UploadImage(IFormFile file, string userId, string conversationId)
    {
        // Validate extension
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            throw new InvalidOperationException("File type not allowed.");

        // Build unique filename to avoid collisions
        var uniqueFileName = $"{Guid.NewGuid()}{ext}";

        var uploadPath = Path.Combine(
            Directory.GetCurrentDirectory(), "wwwroot", "images", "UserMessages", userId
        );
        Directory.CreateDirectory(uploadPath);

        var filePath = Path.Combine(uploadPath, uniqueFileName);

        // Write file to disk
        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Relative URL to return to the client
        var imageUrl = $"/images/UserMessages/{userId}/{uniqueFileName}";

        // Save as a message record in the DB (content = the image URL)
        var message = new Message
        {
            MessageId = Guid.NewGuid(),
            SenderId = Guid.Parse(userId),
            ConversationId = Guid.Parse(conversationId),
            AttachmentPath = imageUrl,       // store the path as message content
            HasAttachment = true,           // flag so the client knows to render <img>
            Sent = DateTime.UtcNow
        };

        var conversation = await _dbContext.Conversations.FindAsync(Guid.Parse(conversationId));
        if (conversation != null)
        {
            conversation.LastMessage = "📷 Image";
            conversation.LastMessageTime = DateTime.UtcNow;
        }

        await repo.AddMessage(message);

        return imageUrl;
    }
}