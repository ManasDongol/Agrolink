namespace AgroLink.Application.DTOs;

public class NewMessageDto
{
    public string MessageId { get; set; } = Guid.NewGuid().ToString();
    public string ConversationId { get; set; } = string.Empty;
    public string SenderId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime Sent { get; set; } = DateTime.UtcNow;
}