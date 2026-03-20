using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;

namespace AgroLink.Application.Services;

public class CommentService
{
    private readonly AgroLinkDbContext _context;

    public CommentService(AgroLinkDbContext context)
    {
        _context = context;
    }
    
    public async Task AddComment(Guid postId, Guid userId, string content, Guid? parentCommentId = null)
    {
        var comment = new Comment
        {
            CommentId = Guid.NewGuid(),
            PostId = postId,
            UserId = userId,
            Content = content,
            ParentCommentId = parentCommentId
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();
    }

   
}