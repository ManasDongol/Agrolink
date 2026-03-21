namespace AgroLink.Application.DTOs;

public class CommentCreateDto
{
    
        public Guid PostId { get; set; }
        public string Content { get; set; }
        public Guid? ParentCommentId { get; set; }
    
}