using AgroLink.Application.DTOs.Posts;

namespace AgroLink.Application.Interfaces.Posts;

public interface IPostService
{
    Task<PostDto> CreatePostAsync(CreatePostDto createPostDto, Guid userId);
    Task<(List<PostDto> Posts, int TotalCount)> GetPostsAsync(int page, int pageSize, bool myPosts, Guid userId);
    Task<List<TagDto>> GetTagsAsync();
}
