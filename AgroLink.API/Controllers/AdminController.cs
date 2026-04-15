using AgroLink.Application.Interfaces;
using AgroLink.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroLink.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController(
    ProfileService service,
    AdminService adminService,
    PostService postService) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await adminService.GetStatsAsync();
        return Ok(stats);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await adminService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPatch("profiles/{userId}/verify")]
    public async Task<IActionResult> VerifyProfile(Guid userId)
    {
        var success = await adminService.VerifyProfileAsync(userId);
        if (!success) return NotFound();

        return Ok(new { message = "Profile verified successfully." });
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> RemoveUser(Guid id)
    {
        var success = await adminService.RemoveUserAsync(id);
        if (!success) return NotFound();

        return NoContent();
    }

    [HttpGet("admins")]
    public async Task<IActionResult> GetAllAdmins()
    {
        var admins = await adminService.GetAllAdminsAsync();
        return Ok(admins);
    }

    [HttpDelete("admins/{id:guid}")]
    public async Task<IActionResult> RemoveAdmin(Guid id)
    {
        var success = await adminService.RemoveAdminAsync(id);
        if (!success) return NotFound();

        return NoContent();
    }

    [HttpGet("posts")]
    public async Task<IActionResult> GetAllPosts()
    {
        var posts = await postService.getallposts();
        return Ok(posts);
    }
    
    [HttpDelete("posts/{postid}")]
    public async Task<IActionResult> removePost(Guid postid)
    {
         await postService.DeletePost(postid);
         return Ok();

    }

    [HttpPut("verify-users/{userId}/approve")]
    public async Task<IActionResult> verifyUserProfile([FromRoute] Guid userId)
    {
        await service.VerifyProfile(userId);
        return NoContent();
    }
    
    [HttpPut("verify-users/{userId}/reject")]
    public async Task<IActionResult> rejectUserProfile([FromRoute] Guid userId)
    {
        await service.VerifyProfile(userId);
        return NoContent();
    }

    [HttpGet("get-profiles")]
    public async Task<IActionResult> getUserProfile()
    {
        var profiles = await service.GetProfiles();
        return Ok(profiles);
    }
}