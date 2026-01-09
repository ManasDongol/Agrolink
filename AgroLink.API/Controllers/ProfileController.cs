using AgroLink.Application.DTOs;
using AgroLink.Application.Services;
using AgroLink.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[Route("/[controller]")]
[ApiController]
public class ProfileController(ProfileService profileService) : ControllerBase
{

    [HttpPost("/build")]
    public IActionResult BuildProfileController([FromBody] ProfileRequestDto dto)
    {
        profileService.BuildProfile(dto);
        return Ok(dto);
    }
    
    
}