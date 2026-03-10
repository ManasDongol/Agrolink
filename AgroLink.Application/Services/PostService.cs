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
            Created = DateTime.UtcNow, // Use UTC
            hasImage = imagePath != null,
            ImagePath = imagePath ?? string.Empty,
            PostCategory = ""
        };

        var createdPost = await postRepo.CreatePostAsync(post);
        return MapToDto(createdPost);
    }

    public async Task<(List<PostDto> Posts, int TotalCount)> GetPostsAsync(int page, int pageSize, bool myPosts, Guid userId)
    {
        var (posts, totalCount) = await postRepo.GetPostsAsync(page, pageSize, myPosts, userId);
        var postDtos = posts.Select(MapToDto).ToList();
        return (postDtos, totalCount);
    }

  

    private PostDto MapToDto(AgroLink.Domain.Entities.Posts post)
    {
        return new PostDto
        {
            PostId = post.PostId,
            Title = post.Title,
            Content = post.Content,
            Created = post.Created,
            ImagePath = post.ImagePath, // Map properly
            Author = new PostUserDto
            {
                UserId = post.UserId,
                Username = post.User?.Username ?? "Unknown", 
                ProfilePictureUrl = post.User?.Profile?.ProfilePicture , // Assuming Profile exists and has ProfilePictureUrl
                Role = post.User?.UserType
            },
            PostCategory = post.PostCategory,
            LikesCount = 0, // Implement real count if entity has it
            CommentsCount = 0,
            IsLiked = false 
        };
    }
    
    
}
