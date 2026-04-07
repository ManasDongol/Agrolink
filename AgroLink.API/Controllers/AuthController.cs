using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AgroLink.Application.DTOs;
using AgroLink.Application.DTOs.Emails;
using AgroLink.Application.Services;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Repositories;
using AgroLink.Infrastructure.Repositories.Auth;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Org.BouncyCastle.Crypto.Generators;

namespace Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(IAuthService authService, UserRepo UserRepo, HashingService hashingService, IConfiguration configuration) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> LoginUser([FromBody] LoginRequestDto dto)
    {
        LoginResponseDto? result = await  authService.LoginUser(dto);
        if (result != null)
        {


            Response.Cookies.Append("jwt", result.token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // only HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddHours(1)
            });

        }

        if (result == null || result.token == null)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }
        return Ok(result);
    }

    [HttpPost("signup")]
    public async Task<IActionResult> SignupUser([FromBody] RegisterRequestDto dto)
    {
        RegisterResponseDto? result = await authService.RegisterUser(dto);

        if (result == null)
            return BadRequest(new { message = "Username or email already exists" });

        Console.WriteLine(result.userID);
        return Ok(new { message = "Signup successful" ,userid = result.userID});
    }
    
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwt");
        return Ok(new { message = "Logged out" });
    }
    
    
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        if (!Request.Cookies.TryGetValue("jwt", out string? token))
            return Unauthorized(new { message = "Not authenticated" });

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(configuration.GetValue<string>("token:Key")!);

        try
        {
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = configuration.GetValue<string>("token:Issuer"),
                ValidateAudience = true,
                ValidAudience = configuration.GetValue<string>("token:Audience"),
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            // Extract user ID from claims
            var jwtToken = (JwtSecurityToken)validatedToken;
            var userIdClaim = jwtToken.Claims.First(x => x.Type == ClaimTypes.NameIdentifier);
            var userId = Guid.Parse(userIdClaim.Value);

            var user = await UserRepo.GetUserByIdAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            Console.WriteLine("token returned successfully");

            return Ok(new UserDto(
                user.UserId.ToString(),
                user.Email,
                user.Username,
                user.UserType
            ));
        }
        catch
        {
            return Unauthorized(new { message = "Invalid token" });
        }
    }


    [HttpGet("profileExists")]
    public async Task<bool> checkprofile(Guid userid)
    {
        return await authService.CheckProfileExists(userid);
    }    
    
    
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        await authService.ForgotPasswordAsync(dto.Email);
        return Ok(new { message = "If that email exists, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var success = await authService.ResetPassword(dto);

        if (!success)
            return BadRequest(new { message = "Invalid or expired reset link." });

        return Ok(new { message = "Password reset successfully. You can now log in." });
    }
}