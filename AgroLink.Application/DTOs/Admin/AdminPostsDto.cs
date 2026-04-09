namespace AgroLink.Application.DTOs.Admin;

public class AdminPostDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public DateTime Created { get; set; }
    public string Category { get; set; } = string.Empty;
}