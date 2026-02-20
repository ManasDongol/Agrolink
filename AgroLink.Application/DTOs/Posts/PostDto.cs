using AgroLink.Application.DTOs.Network;

namespace AgroLink.Application.DTOs.Posts;

public class PostDto
{
    public Guid PostId { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public DateTime Created { get; set; }
    public string? ImagePath { get; set; }
    public PostUserDto Author { get; set; }
    public List<TagDto> Tags { get; set; } = new();
    public bool IsLiked { get; set; } 
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
}

public class PostUserDto 
{
    public Guid UserId { get; set; }
    public string Username { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? Role { get; set;}
}
