using Microsoft.AspNetCore.Http;

namespace AgroLink.Application.DTOs.Posts;

public class UpdatePostDto
{
    public string Title { get; set; }
    public string Content { get; set; }
    public Guid TagId { get; set; }
    public string PostCategory { get; set; }
    public IFormFile? Image { get; set; }
}