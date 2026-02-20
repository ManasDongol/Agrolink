using Microsoft.AspNetCore.Http;

namespace AgroLink.Application.DTOs.Posts;

public class CreatePostDto
{
    public string Title { get; set; }
    public string Content { get; set; }
    public Guid TagId { get; set; }
    public IFormFile? Image { get; set; }
}
