using System.ComponentModel;
using AgroLink.Application.DTOs.Posts;
using AgroLink.Application.Interfaces.Posts;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Repositories.Posts;
using PostDto = AgroLink.Application.DTOs.Posts.PostDto;
using PostUserDto = AgroLink.Application.DTOs.Posts.PostUserDto;

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
    
    public async Task<List<Infrastructure.Repositories.Posts.PostDto>> getUserPost(string UserId)
    {
        var userGuid = Guid.Parse(UserId);
        var userPosts = await postRepo.GetUserPostsAsync(userGuid);
        return userPosts;
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
    
    public async Task<List<DTOs.Posts.PostDto>> GetUserPosts( Guid userId)
    {
       
      
        var postlist = await postRepo.GetUserPostsByIdAsync( userId);
        
        var userPostList = postlist.Select(x=> new PostDto{
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
            }).ToList();
        
        return userPostList;
    }
    
    
    
    public async Task<PostDto> UpdatePostAsync(Guid postId, UpdatePostDto updatePostDto, Guid userId)
    {
        // Get the existing post
        var post = await postRepo.GetPostByIdAsync(postId);
        if (post == null) throw new Exception("Post not found");


        if (post.UserId != userId) throw new UnauthorizedAccessException("You cannot edit this post");

        // Update basic fields
        post.Title = updatePostDto.Title;
        post.Content = updatePostDto.Content;
        post.PostCategory = updatePostDto.PostCategory;

        // Handle image replacement (optional)
        if (updatePostDto.Image != null)
        {
            // Delete old image if exists
            if (!string.IsNullOrEmpty(post.ImagePath))
            {
                var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", post.ImagePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                if (File.Exists(oldPath))
                {
                    File.Delete(oldPath);
                }
            }

            // Save new image
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(updatePostDto.Image.FileName)}";
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "images", "UserPosts");
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            var filePath = Path.Combine(uploadPath, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await updatePostDto.Image.CopyToAsync(stream);
            }

            post.ImagePath = $"/uploads/images/UserPosts/{fileName}";
            post.hasImage = true;
        }

        // Save changes
        var updatedPost = await postRepo.UpdatePostAsync(post);

        return MapToDto(updatedPost, userId);
    }

    public async Task ToggleLikeAsync(Guid postId, Guid userId)
    {
        await postRepo.ToggleLikeAsync(postId, userId);
    }

    public async Task ToggleBookmarkAsync(Guid postId, Guid userId)
    {
        await postRepo.ToggleBookmarkAsync(postId, userId);
    }

    public async Task DeletePost(Guid postId)
    {
        await postRepo.DeletePostAsync(postId);
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
