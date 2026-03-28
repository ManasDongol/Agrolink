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

    public async Task DeletePostAsync(Guid postId)
    {
         dbContext.Posts.Remove(await dbContext.Posts.FindAsync(postId));
         await dbContext.SaveChangesAsync();
    }
    
    public async Task<Domain.Entities.Posts> UpdatePostAsync(Domain.Entities.Posts updatedPost)
    {
        // Fetch existing post from DB
        var existingPost = await dbContext.Posts
            .FirstOrDefaultAsync(p => p.PostId == updatedPost.PostId);

        if (existingPost == null)
            throw new Exception("Post not found");

        // Update fields
        existingPost.Title = updatedPost.Title;
        existingPost.Content = updatedPost.Content;
        existingPost.PostCategory = updatedPost.PostCategory;
        existingPost.ImagePath = updatedPost.ImagePath;
        existingPost.hasImage = updatedPost.hasImage;

        // Save changes
        await dbContext.SaveChangesAsync();

        // Load navigation properties for mapping to DTO
        await dbContext.Entry(existingPost).Reference(p => p.User).LoadAsync();
        await dbContext.Entry(existingPost).Collection(p => p.Likes).LoadAsync();
        await dbContext.Entry(existingPost).Collection(p => p.Bookmarks).LoadAsync();
        await dbContext.Entry(existingPost).Collection(p => p.Comments).LoadAsync();

        return existingPost;
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

    public async Task<List<PostDto>> GetUserPostsAsync(Guid userid)
    {
        return await dbContext.Posts
            .Where(r => r.UserId == userid)
            .Include(p => p.User)
            .ThenInclude(u => u.Profile)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .Include(p => p.Bookmarks)
            .Select(x=>new PostDto
            {
                PostId = x.PostId,
                Title = x.Title,
                Content = x.Content,
                PostCategory = x.PostCategory,
                ImagePath = x.ImagePath,
                Author = new PostUserDto
                {
                    ProfilePictureUrl = x.User.Profile.ProfilePicture,
                    Role = x.User.Profile.Role,
                    UserId = x.User.UserId,
                    Username = x.User.Username,
                },
                Created = x.Created,
                LikesCount = x.Likes.Count,
                CommentsCount = x.Comments.Count,
                BookmarksCount = x.Bookmarks.Count
                
                
                
            })
            .ToListAsync();

    }

    
    public async Task<List<Domain.Entities.Posts>> GetUserPostsByIdAsync(Guid userid)
    {
        return await dbContext.Posts
            .Where(r => r.UserId == userid)
            .Include(p => p.User)
            .ThenInclude(u => u.Profile)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .Include(p => p.Bookmarks)
            .ToListAsync();
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

public class PostDto
{
    public Guid PostId { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public DateTime Created { get; set; }
    public string? ImagePath { get; set; }
    public PostUserDto Author { get; set; }
    public string PostCategory { get; set; }
    public bool IsLiked { get; set; } 
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
    public bool IsBookmarked { get; set; }
    public int BookmarksCount { get; set; }
}

public class PostUserDto 
{
    public Guid UserId { get; set; }
    public string Username { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? Role { get; set;}
}