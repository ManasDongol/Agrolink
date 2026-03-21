namespace AgroLink.Application.DTOs.Posts;

public class CommentAuthorDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; }
    public string ProfilePictureUrl { get; set; }
}