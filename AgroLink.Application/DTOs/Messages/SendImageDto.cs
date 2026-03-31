namespace AgroLink.Application.DTOs.Messages;

using Microsoft.AspNetCore.Http;



public class SendImageDto
{
    public IFormFile File { get; set; }
    public Guid ConversationId { get; set; }
}