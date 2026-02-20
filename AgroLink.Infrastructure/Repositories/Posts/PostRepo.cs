using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.Infrastructure.Repositories.Posts;

public class PostRepo(AgroLinkDbContext dbContext)
{
    public async Task<Domain.Entities.Posts> CreatePostAsync(AgroLink.Domain.Entities.Posts post)
    {
        dbContext.Posts.Add(post);
        await dbContext.SaveChangesAsync();
        // Reload to get included data if needed, but for create usually not needed unless returning full DTO
        // However, we might want to load User to return proper Author DTO
        await dbContext.Entry(post).Reference(p => p.User).LoadAsync();
        await dbContext.Entry(post).Collection(p => p.Tags).LoadAsync();
        return post;
    }

    public async Task<(List<AgroLink.Domain.Entities.Posts> Posts, int TotalCount)> GetPostsAsync(int page, int pageSize, bool myPosts, Guid? userId)
    {
        IQueryable<AgroLink.Domain.Entities.Posts> query = dbContext.Posts
            .Include(p => p.User)
             .ThenInclude(u => u.Profile) 
            .Include(p => p.Tags)
            .OrderByDescending(p => p.Created);

        if (myPosts && userId.HasValue)
        {
            query = query.Where(p => p.UserId == userId.Value);
        }

        int totalCount = await query.CountAsync();
        var posts = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return (posts, totalCount);
    }
    
    public async Task<List<Tag>> GetTagsAsync()
    {
        return await dbContext.Tags.ToListAsync();
    }

    public async Task<Tag?> GetTagByIdAsync(Guid tagId)
    {
        return await dbContext.Tags.FindAsync(tagId);
    }
    
    public async Task<AgroLink.Domain.Entities.Posts?> GetPostByIdAsync(Guid postId)
    {
         return await dbContext.Posts
            .Include(p => p.User)
            .ThenInclude(u => u.Profile)
            .Include(p => p.Tags)
            .FirstOrDefaultAsync(p => p.PostId == postId);
    }
}
