using System.Security.Claims;
using AgroLink.Application.Interfaces.Posts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroLink.API.Controllers;



[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookmarkController(IPostService postService): ControllerBase
{
    [HttpPost("{postId}/bookmark")]
    public async Task<IActionResult> ToggleBookmark(Guid postId)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        try
        {
            var result = await postService.ToggleBookmarkAsync(postId, userId);

            if (!result)
                return NotFound(new { message = "Post not found or deleted" });
            return Ok(new { message = "Bookmark updated" });

        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Post not found or deleted" });
        }
    }

   
}