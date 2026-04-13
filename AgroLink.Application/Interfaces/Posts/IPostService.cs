using AgroLink.Application.DTOs.Posts;

namespace AgroLink.Application.Interfaces.Posts;

public interface IPostService
{
    Task<PostDto> CreatePostAsync(CreatePostDto createPostDto, Guid userId);
    Task DeletePost(Guid  postId);
    Task<(List<PostDto> Posts, int TotalCount)> GetPostsAsync(int page, int pageSize, string myPosts, Guid userId);
    Task<bool> ToggleLikeAsync(Guid postId, Guid userId);
    Task<bool> ToggleBookmarkAsync(Guid postId, Guid userId);
    Task<PostDto> UpdatePostAsync(Guid postId, UpdatePostDto updatePostDto, Guid userId);
    Task<List<DTOs.Posts.PostDto>> GetUserPosts(Guid userid);

}
