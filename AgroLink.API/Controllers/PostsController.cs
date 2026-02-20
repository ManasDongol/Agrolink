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

        bool myPosts = view.ToLower() == "my";
        var (posts, totalCount) = await postService.GetPostsAsync(page, pageSize, myPosts, userId);
        
        return Ok(new 
        {
            posts,
            total = totalCount,
            page,
            pageSize
        });
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

    [HttpGet("tags")]
    public async Task<IActionResult> GetTags()
    {
        var tags = await postService.GetTagsAsync();
        return Ok(tags);
    }
}