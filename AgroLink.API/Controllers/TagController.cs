using Microsoft.AspNetCore.Mvc;

namespace AgroLink.API.Controllers;


[ApiController]
[Route("api/[controller]")]
public class TagController : ControllerBase
{
    [HttpGet]
    public IActionResult GetTags()
    {
        return Ok("Tags");
    }
}