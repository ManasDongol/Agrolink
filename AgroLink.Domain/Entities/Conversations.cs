namespace AgroLink.Domain.Entities;

public class Conversations
{
    public Guid Id { get; set; } = new Guid();

    public Guid User1Id { get; set; }

    public Guid User2Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public ICollection<Messages> Messages { get; set; }
}