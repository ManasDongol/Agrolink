using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgroLink.Domain.Entities;

public class Message
{
    [Key]
    public Guid MessageId { get; set; } = Guid.NewGuid();
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    
    public bool HasAttachment { get; set; } = false;
    public string? AttachmentPath { get; set; } 

    public string? Content { get; set; } = null!;
    public DateTime Sent { get; set; } = DateTime.UtcNow;

    public Conversation Conversation { get; set; } = null!;
    public User Sender { get; set; } = null!;
}