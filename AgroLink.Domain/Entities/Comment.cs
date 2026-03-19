using System.ComponentModel.DataAnnotations;

namespace AgroLink.Domain.Entities;

public class Comment
{
    [Key]
    public Guid CommentId { get; set; }

    public Guid UserId { get; set; }
    public Guid PostId { get; set; }

    public string Content { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; }
    public Posts Post { get; set; }
}