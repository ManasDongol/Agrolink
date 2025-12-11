using System.ComponentModel.DataAnnotations;

namespace AgroLink.Domain.Entities;

public class Messages
{
    [Key]
    public int MessageId { get; set; }
    
    public Guid UserId { get; set; }
    public Guid ReceiverId { get; set; }
    public string Message { get; set; }
    public DateTime sent { get; set; }
    public bool? attachment { get; set; }
    public string AttachmentPath { get; set; }
    
    //nav property
    public User User { get; set; }
}