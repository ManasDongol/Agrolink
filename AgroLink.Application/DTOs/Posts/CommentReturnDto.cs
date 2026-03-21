using Microsoft.AspNetCore.Http;

namespace AgroLink.Application.DTOs.Posts;

public class CommentReturnDto
{
    public Guid PostId { get; set; }
    public Guid CommentId { get; set; }
    public string Content { get; set; }
    
    public Guid? ParentCommentId { get; set; }
    

    
    public CommentAuthorDto  Author { get; set; }
    public DateTime Created { get; set; }
}