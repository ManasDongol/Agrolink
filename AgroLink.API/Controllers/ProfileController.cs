using AgroLink.Application.DTOs;
using AgroLink.Application.Services;
using AgroLink.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProfileController(ProfileService profileService) : ControllerBase
{

    [HttpPost("build")]
    public async Task<IActionResult> BuildProfileController([FromBody] ProfileRequestDto dto)
    {
        try
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Profile data is required" });
            }

            var result = await profileService.BuildProfile(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating profile: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { message = "An error occurred while creating the profile", error = ex.Message });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetProfileByUserId(Guid userId)
    {
        try
        {
            var result = await profileService.GetProfileByUserId(userId);
            
            if (result == null)
            {
                return NotFound(new { message = "Profile not found" });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching profile: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { message = "An error occurred while fetching the profile", error = ex.Message });
        }
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentUserProfile()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var result = await profileService.GetProfileByUserId(userId);
            
            if (result == null)
            {
                return NotFound(new { message = "Profile not found" });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching profile: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { message = "An error occurred while fetching the profile", error = ex.Message });
        }
    }
    
    
}