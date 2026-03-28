using AgroLink.Domain.Entities;

public class Conversation
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid User1Id { get; set; }
    public Guid User2Id { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public string? LastMessage { get; set; }       // ← add
    public DateTime? LastMessageTime { get; set; }

    public ICollection<Message> Messages { get; set; } = new List<Message>();

    public User User1 { get; set; } = null!;
    public User User2 { get; set; } = null!;
}