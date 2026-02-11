using AgroLink.Application.Services;
using AgroLink.Application.DTOs.Network;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Controllers;

[Route("api/[controller]")]
[ApiController]
public class NetworkController(NetworkService networkService) : ControllerBase
{
    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
        {
            throw new UnauthorizedAccessException("User not authenticated");
        }
        return userId;
    }

    [HttpGet]
    public async Task<IActionResult> GetNetworkPage([FromQuery] string? username, [FromQuery] string? role, [FromQuery] int page = 1, [FromQuery] int pageSize = 12)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await networkService.GetNetworkPageAsync(userId, username, role, page, pageSize);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching network page", error = ex.Message });
        }
    }

    [HttpPost("connect/{targetUserId}")]
    public async Task<IActionResult> SendConnectionRequest(Guid targetUserId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await networkService.SendConnectionRequestAsync(userId, targetUserId);
            // If result is false, it might imply failure, but for now just BadRequest
            if (!result) return BadRequest(new { message = "Request already pending or users already connected" });
            return Ok(new { message = "Connection request sent" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error sending request", error = ex.Message });
        }
    }

    [HttpPost("accept/{requestId}")]
    public async Task<IActionResult> AcceptConnectionRequest(Guid requestId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await networkService.AcceptConnectionRequestAsync(userId, requestId);
            if (!result) return BadRequest(new { message = "Request not found or invalid" });
            return Ok(new { message = "Connection request accepted" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error accepting request", error = ex.Message });
        }
    }
}
