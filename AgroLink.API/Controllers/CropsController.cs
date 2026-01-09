using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Controllers;


[ApiController]
[Route("[controller]")]
public class CropsController : ControllerBase
{
    [Authorize]
    [HttpGet("/crops")]
    public IActionResult GetCropInfo()
    {
        return Ok("done");
    }
    
    
    
}