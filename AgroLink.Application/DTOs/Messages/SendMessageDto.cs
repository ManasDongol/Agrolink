namespace AgroLink.Application.DTOs;

public class SendMessageDto
{
    public Guid SenderId { get; set; }
    public Guid ConversationId { get; set; }
    public string Content { get; set; }
}