using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Query.Internal;
using StackExchange.Redis;

namespace AgroLink.API.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
  [Authorize(Roles = "Admin")]
  [HttpGet("/allPosts")]
  public void GetAllPosts()
  {
    
  }
  
  
  
  
  [Authorize(Roles = "Admin")]
  [HttpGet("/allUsers")]
  public void GetAllUsers()
  {
    
  }
  
  [Authorize(Roles = "Admin")]
  [HttpDelete("/RemoveUser")]
  public void RemoveUser()
  {
    
  }

  [Authorize(Roles = "Admin")]
  [HttpGet("/allAdmins")]
  public void GetAllAdmin()
  {
    
  }

  [Authorize(Roles = "SuperAdmin,Admin")]
  [HttpDelete("/RemoveAdmin")]
  public void RemoveAdmin()
  {
    
  }
  
  
    
    
}