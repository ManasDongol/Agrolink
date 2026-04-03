using AgroLink.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.API.Controllers;


[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class AdminController(AgroLinkDbContext dbContext) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await dbContext.Users.CountAsync();
        var totalAdmins = await dbContext.Users.CountAsync(u => u.UserType == "Admin" || u.UserType == "SuperAdmin");
        var totalPosts = await dbContext.Posts.CountAsync();

        return Ok(new
        {
            totalUsers,
            totalAdmins,
            totalPosts
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await dbContext.Users
            .AsNoTracking()
            .OrderBy(u => u.Username)
            .ToListAsync();

        var result = users.Select(u => new
        {
            id = u.UserId,
            username = u.Username,
            email = u.Email,
            userType = u.UserType
        });

        return Ok(result);
    }
    

    [HttpPatch("profiles/{userId}/verify")]
    public async Task<IActionResult> VerifyProfile(Guid userId)
    {
        var profile = await dbContext.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return NotFound();
        profile.isVerified = true;
        await dbContext.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> RemoveUser(Guid id)
    {
        var user = await dbContext.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("admins")]
    public async Task<IActionResult> GetAllAdmins()
    {
        var admins = await dbContext.Users
            .AsNoTracking()
            .Where(u => u.UserType == "Admin" || u.UserType == "SuperAdmin")
            .OrderBy(u => u.Username)
            .ToListAsync();

        var result = admins.Select(u => new
        {
            id = u.UserId,
            username = u.Username,
            email = u.Email,
            userType = u.UserType
        });

        return Ok(result);
    }

    [HttpDelete("admins/{id:guid}")]
    public async Task<IActionResult> RemoveAdmin(Guid id)
    {
        var admin = await dbContext.Users.FindAsync(id);
        if (admin == null)
        {
            return NotFound();
        }

        dbContext.Users.Remove(admin);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("posts")]
    public async Task<IActionResult> GetAllPosts()
    {
        var posts = await dbContext.Posts
            .Include(p => p.User)
            .AsNoTracking()
            .OrderByDescending(p => p.Created)
            .ToListAsync();

        var result = posts.Select(p => new
        {
            id = p.PostId,
            title = p.Title,
            author = p.User != null ? p.User.Username : "Unknown",
            created = p.Created,
            category = p.PostCategory
        });

        return Ok(result);
    }
}