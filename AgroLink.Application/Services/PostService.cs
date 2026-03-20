using System.ComponentModel;
using AgroLink.Application.DTOs.Posts;
using AgroLink.Application.Interfaces.Posts;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Repositories.Posts;

namespace AgroLink.Application.Services;

public class PostService(PostRepo postRepo) : IPostService
{
    public async Task<PostDto> CreatePostAsync(CreatePostDto createPostDto, Guid userId)
    {
       

        string? imagePath = null;
        if (createPostDto.Image != null)
        {
            
            
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(createPostDto.Image.FileName)}";
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads","images","UserPosts"); 
            // Note: Directory.GetCurrentDirectory() usually points to the API project root when running.
            
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }
            
            var filePath = Path.Combine(uploadPath, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await createPostDto.Image.CopyToAsync(stream);
            }
            
            imagePath = $"/uploads/images/UserPosts/{fileName}";
        }

        var post = new AgroLink.Domain.Entities.Posts
        {
            PostId = Guid.NewGuid(),
            UserId = userId,
            Title = createPostDto.Title,
            Content = createPostDto.Content,
            Created = DateTime.UtcNow, 
            hasImage = imagePath != null,
            ImagePath = imagePath ?? string.Empty,
            PostCategory = ""
        };

        var createdPost = await postRepo.CreatePostAsync(post);
        return MapToDto(createdPost,userId);
    }

    public async Task<(List<PostDto> Posts, int TotalCount)> GetPostsAsync(int page, int pageSize, string myPosts, Guid userId)
    {
        var value = 0;
        if (myPosts == "my")
        {
            value = 1;
        }else if(myPosts == "bookmarks")
        {
            value = 2;
        }
        var (posts, totalCount) = await postRepo.GetPostsAsync(page, pageSize, value, userId);
        var postDtos = posts.Select(p=>MapToDto(p,userId)).ToList();
        return (postDtos, totalCount);
    }

    public async Task ToggleLikeAsync(Guid postId, Guid userId)
    {
        await postRepo.ToggleLikeAsync(postId, userId);
    }

    public async Task ToggleBookmarkAsync(Guid postId, Guid userId)
    {
        await postRepo.ToggleBookmarkAsync(postId, userId);
    }
  

    private PostDto MapToDto(Posts post, Guid currentUserId)
    {
        return new PostDto
        {
            PostId = post.PostId,
            Title = post.Title,
            Content = post.Content,
            Created = post.Created,
            ImagePath = post.ImagePath,
            Author = new PostUserDto
            {
                UserId = post.UserId,
                Username = post.User?.Username ?? "Unknown",
                ProfilePictureUrl = post.User?.Profile?.ProfilePicture,
                Role = post.User?.UserType
            },
            PostCategory = post.PostCategory,

            LikesCount = post.Likes?.Count ?? 0,
            IsLiked = post.Likes?.Any(l => l.UserId == currentUserId) ?? false,
            IsBookmarked = post.Bookmarks?.Any(b => b.UserId == currentUserId) ?? false,
            BookmarksCount = post.Bookmarks?.Count ?? 0,

            CommentsCount = post.Comments?.Count ?? 0
        };
    }
    
    
}
