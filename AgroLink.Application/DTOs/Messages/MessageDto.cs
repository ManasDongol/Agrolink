namespace AgroLink.Application.DTOs.Messages;

public class MessageDto
{
    public Guid MessageId { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; }
    public DateTime Sent { get; set; }
    public bool IsImage { get; set; }
}