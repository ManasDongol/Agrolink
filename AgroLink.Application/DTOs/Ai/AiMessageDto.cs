namespace AgroLink.Application.DTOs.Ai;

public class AiMessageDto
{
    public string Role { get; set; } = string.Empty;
    public string? Content { get; set; }
    public bool IsImage { get; set; }
    public string? ImagePath { get; set; }
    public DateTime CreatedAt { get; set; }
}