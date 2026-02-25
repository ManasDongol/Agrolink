using AgroLink.Application.DTOs;
using AgroLink.Application.Services;
using AgroLink.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProfileController(ProfileService profileService,IWebHostEnvironment _environment) : ControllerBase
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

            var result = await profileService.BuildProfile(dto,null,null);
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
    
    [HttpPut("update")]
    public async Task<IActionResult> UpdateProfile(
        [FromForm] ProfileRequestDto dto,
        [FromForm] IFormFile? ProfileImage,
        [FromForm] IFormFile? BackgroundImage)
    {
        var uploadsFolder = Path.Combine(_environment.WebRootPath, "images");

        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        string? profileImageUrl = null;
        string? backgroundImageUrl = null;

        if (ProfileImage != null)
        {
            var profileFolder = Path.Combine(
                _environment.WebRootPath,
                "uploads",
                "images",
                "profilePictures"
            );

            Directory.CreateDirectory(profileFolder);

            var fileName = Guid.NewGuid() + Path.GetExtension(ProfileImage.FileName);
            var filePath = Path.Combine(profileFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await ProfileImage.CopyToAsync(stream);

            profileImageUrl = $"/uploads/images/profilePictures/{fileName}";
        }
        if (BackgroundImage != null)
        {
            var backgroundFolder = Path.Combine(
                _environment.WebRootPath,
                "uploads",
                "images",
                "backgroundPictures"
            );

            Directory.CreateDirectory(backgroundFolder);

            var fileName = Guid.NewGuid() + Path.GetExtension(BackgroundImage.FileName);
            var filePath = Path.Combine(backgroundFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await BackgroundImage.CopyToAsync(stream);

            backgroundImageUrl = $"/uploads/images/backgroundPictures/{fileName}";
        }

        // Call your Application layer here
        Console.WriteLine(profileImageUrl);
        Console.WriteLine(backgroundImageUrl);
        await profileService.BuildProfile(dto, profileImageUrl, backgroundImageUrl);

        return Ok();
    }
    
    
}