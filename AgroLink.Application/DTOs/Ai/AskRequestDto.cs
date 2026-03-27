namespace AgroLink.Application.DTOs.Ai;

public class AskRequestDto
{    public string Query { get; set; } = string.Empty;
    public Guid? SessionId { get; set; }
    
}