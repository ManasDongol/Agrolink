using AgroLink.Application.DTOs.Posts;
using AgroLink.Application.Interfaces.Posts;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Repositories.Posts;

namespace AgroLink.Application.Services;

public class PostService(PostRepo postRepo) : IPostService
{
    public async Task<PostDto> CreatePostAsync(CreatePostDto createPostDto, Guid userId)
    {
        var tag = await postRepo.GetTagByIdAsync(createPostDto.TagId);
        if (tag == null)
        {
            throw new Exception("Tag not found");
        }

        string? imagePath = null;
        if (createPostDto.Image != null)
        {
            
            
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(createPostDto.Image.FileName)}";
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads"); 
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
            
            imagePath = $"/uploads/{fileName}";
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
            Tags = new List<Tag> { tag }
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

    public async Task<List<TagDto>> GetTagsAsync()
    {
        var tags = await postRepo.GetTagsAsync();
        return tags.Select(t => new TagDto
        {
            TagId = t.TagId,
            Name = t.Name
        }).ToList();
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
            Tags = post.Tags.Select(t => new TagDto { TagId = t.TagId, Name = t.Name }).ToList(),
            LikesCount = 0, // Implement real count if entity has it
            CommentsCount = 0,
            IsLiked = false 
        };
    }
}
