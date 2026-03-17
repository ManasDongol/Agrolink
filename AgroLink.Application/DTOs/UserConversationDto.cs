namespace AgroLink.Application.DTOs;

public class UserConversationDto
{
    public Guid Id { get; set; }
    public Guid User1Id { get; set; }
    public Guid User2Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<MessageDto> Messages { get; set; }
}