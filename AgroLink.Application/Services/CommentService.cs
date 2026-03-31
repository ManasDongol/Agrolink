using AgroLink.Application.DTOs.Posts;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

public class CommentService
{
    private readonly AgroLinkDbContext _context;

    public CommentService(AgroLinkDbContext context)
    {
        _context = context;
    }

    public async Task<CommentReturnDto> AddComment(Guid postId, Guid userId, string content, Guid? parentCommentId = null)
    {
        var user = await _context.Users
            .Include(u => u.Profile) // ✅ IMPORTANT
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
            throw new Exception("User not found");
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


        var newComment = new CommentReturnDto
        {
            CommentId = comment.CommentId,
            PostId = comment.PostId,
            Content = comment.Content,
            ParentCommentId = parentCommentId,
            Author =new CommentAuthorDto 
            {
                UserId = user.UserId,
                Username = user.Username,
                ProfilePictureUrl = user.Profile.ProfilePicture
            },
            Created = comment.CreatedAt,

        };
        return newComment;
    }

    // Get all comments for a post including replies
    public async Task<List<CommentReturnDto>> GetCommentsByPost(Guid postId)
    {
        var topLevel = await _context.Comments
            .Where(c => c.PostId == postId && c.ParentCommentId == null)
            .Include(c => c.User)
            .ThenInclude(u => u.Profile)
            .Include(c => c.Replies)           // ← include replies navigation
            .ThenInclude(r => r.User)
            .ThenInclude(u => u.Profile)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return topLevel.Select(c => new CommentReturnDto
        {
            CommentId = c.CommentId,
            PostId = c.PostId,
            Content = c.Content,
            ParentCommentId = c.ParentCommentId,
            Created = c.CreatedAt,
            Author = new CommentAuthorDto
            {
                UserId = c.User.UserId,
                Username = c.User.Username,
                ProfilePictureUrl = c.User.Profile.ProfilePicture
            },
            Replies = c.Replies.Select(r => new CommentReturnDto   // ← map replies too
            {
                CommentId = r.CommentId,
                PostId = r.PostId,
                Content = r.Content,
                ParentCommentId = r.ParentCommentId,
                Created = r.CreatedAt,
                Author = new CommentAuthorDto
                {
                    UserId = r.User.UserId,
                    Username = r.User.Username,
                    ProfilePictureUrl = r.User.Profile.ProfilePicture
                }
            }).ToList()
        }).ToList();
    }
    // Delete a comment
    public async Task DeleteComment(Guid commentId)
    {
        var comment = await _context.Comments.FindAsync(commentId);
        if (comment != null)
        {
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
        }
    }
    
    public async Task<List<CommentReturnDto>> GetRepliesByComment(Guid commentId)
    {
        return await _context.Comments
            .Where(c => c.ParentCommentId == commentId)
            .Include(c => c.User)
            .ThenInclude(u => u.Profile)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CommentReturnDto
            {
                CommentId = c.CommentId,
                PostId = c.PostId,
                Content = c.Content,
                ParentCommentId = c.ParentCommentId,
                Created = c.CreatedAt,
                Author = new CommentAuthorDto
                {
                    UserId = c.User.UserId,
                    Username = c.User.Username,
                    ProfilePictureUrl = c.User.Profile.ProfilePicture
                }
            })
            .ToListAsync();
    }
}