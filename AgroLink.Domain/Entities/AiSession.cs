namespace AgroLink.Domain.Entities;

public class AiSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public ICollection<AiMessage> AiMessages { get; set; } = new List<AiMessage>();
    
    public int MessageCount { get; set; } = 0;      // increment each exchange
    public int DailyMessageCount { get; set; } = 0; 
}