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
    public async Task<IActionResult> AddBookmark(Guid postId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // however you extract from JWT

        await postService.ToggleBookmarkAsync(postId, Guid.Parse(userId));

        return Ok();
        
    }

   
}