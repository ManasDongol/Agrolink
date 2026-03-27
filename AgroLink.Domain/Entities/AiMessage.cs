namespace AgroLink.Domain.Entities;

public enum AiMessageRole { User, Ai }

public class AiMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? Content { get; set; }          // nullable — image messages may have no text
    public AiMessageRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsImage { get; set; } = false;    // ← flag
    public string? ImagePath { get; set; }        // ← stored path after upload

    public Guid AiSessionId { get; set; }
    public AiSession AiSession { get; set; } = null!;
}