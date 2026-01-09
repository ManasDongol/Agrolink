using AgroLink.Application.DTOs;
using AgroLink.Application.Services;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Repositories;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(IAuthService authService, UserRepo UserRepo, HashingService hashingService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> LoginUser([FromBody] LoginRequestDto dto)
    {
        var result = await  authService.LoginUser(dto);
        if (result == null)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }
        return Ok(result);
    }

    [HttpPost("signup")]
    public async Task<IActionResult> SignupUser([FromBody] RegisterRequestDto dto)
    {
        RegisterRequestDto? result = await authService.RegisterUser(dto);

        if (result == null)
            return BadRequest(new { message = "Username or email already exists" });

        return Ok(new { message = "Signup successful" });
    }
}