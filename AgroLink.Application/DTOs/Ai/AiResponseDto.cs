namespace AgroLink.Application.DTOs.Ai;
public class AiResponseDto
{
    public string Answer { get; set; } = string.Empty;
    public Guid SessionId { get; set; }
    public string SessionTitle { get; set; } = string.Empty;
    public int QueriesUsed { get; set; }
    public int QueriesRemaining { get; set; }
    public bool ConversationEnded { get; set; }  // true when 10th query is hit
}
