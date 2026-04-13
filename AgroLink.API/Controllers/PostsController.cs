using System.Security.Claims;
using AgroLink.Application.DTOs.Posts;
using AgroLink.Application.Interfaces.Posts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroLink.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostsController(IPostService postService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string view = "all")
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId))
        {
             return Unauthorized();
        }

        var postType = view.ToLower();
        var (posts, totalCount) = await postService.GetPostsAsync(page, pageSize, postType, userId);
        
        return Ok(new 
        {
            posts,
            total = totalCount,
            page,
            pageSize
        });
    }
    
    [HttpPost("{postId}/like")]
    public async Task<IActionResult> ToggleLike(Guid postId)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        try
        {
            var result= await postService.ToggleLikeAsync(postId, userId);
             if (!result)
                return NotFound(new { message = "Post not found or deleted" });
            return Ok(new { message = "like updated" });

        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Post not found" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromForm] CreatePostDto createPostDto)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var createdPost = await postService.CreatePostAsync(createPostDto, userId);
            return CreatedAtAction(nameof(GetPosts), new { id = createdPost.PostId }, createdPost);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{postId}/delete")]
    public async Task<IActionResult> DeletePost(Guid postId)
    {
        await postService.DeletePost(postId);
        return NoContent();
    }
    
    [HttpPost("{postId}/update")]
    public async Task<IActionResult> updatePost([FromForm] UpdatePostDto updatePostDto,[FromRoute] string postId)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        Guid.TryParse(postId, out var PostId);

        try
        {
            var createdPost = await postService.UpdatePostAsync(PostId, updatePostDto, userId);
            return CreatedAtAction(nameof(GetPosts), new { id = createdPost.PostId }, createdPost);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{userId}/all")]
    public async Task<ActionResult<List<PostDto>>> GetPosts(Guid userId)
    {
        Console.WriteLine("this has been hit" + userId);
        var userposts = await postService.GetUserPosts(userId);
        return Ok(userposts);
        
    }

  
}