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
    
        await dbContext.Entry(post).Reference(p => p.User).LoadAsync();
 
        return post;
    }

    public async Task<(List<AgroLink.Domain.Entities.Posts> Posts, int TotalCount)> GetPostsAsync(int page, int pageSize, int postType, Guid? userId)
    {
        IQueryable<AgroLink.Domain.Entities.Posts> query = dbContext.Posts
            .Include(p => p.User)
             .ThenInclude(u => u.Profile)
            .Include(p => p.Likes)            
            .Include(p => p.Comments)
            .Include(p=>p.Bookmarks)
            .OrderByDescending(p => p.Created);

        if (postType==1 && userId.HasValue)
        {
            query = query.Where(p => p.UserId == userId.Value);
        }
        else if(postType==2 && userId.HasValue)
        {
            query = query.Where(p => p.Bookmarks.Any(b => b.UserId == userId.Value));;
        }

        int totalCount = await query.CountAsync();
        var posts = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return (posts, totalCount);
    }
    
   
    
    public async Task<AgroLink.Domain.Entities.Posts?> GetPostByIdAsync(Guid postId)
    {
         return await dbContext.Posts
            .Include(p => p.User)
            .ThenInclude(u => u.Profile)
            .Include(p => p.Likes)          //  IMPORTANT
            .Include(p => p.Comments)
            .Include(p => p.Bookmarks)
            .FirstOrDefaultAsync(p => p.PostId == postId);
    }

    public async Task ToggleLikeAsync(Guid postId, Guid userId)
    {
        var existingLike = await dbContext.Set<Like>()
            .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);

        if (existingLike != null)
        {
            // Unlike
            dbContext.Set<Like>().Remove(existingLike);
        }
        else
        {
            //  Like
            var like = new Like()
            {
                PostId = postId,
                UserId = userId
            };

            await dbContext.Set<Like>().AddAsync(like);
        }

        await dbContext.SaveChangesAsync();
    }
    
    public async Task ToggleBookmarkAsync(Guid postId, Guid userId)
    {
        var bookmark = await dbContext.Set<Bookmark>()
            .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);

        if (bookmark != null)
        {
            // Unlike
            dbContext.Set<Bookmark>().Remove(bookmark);
        }
        else
        {
            //  Like
            var newbookmark = new Bookmark
            {
                PostId = postId,
                UserId = userId
            };

            await dbContext.Set<Bookmark>().AddAsync(newbookmark);
        }

        await dbContext.SaveChangesAsync();
    }
}
