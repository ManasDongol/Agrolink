using Microsoft.AspNetCore.Mvc;
namespace Controllers;


[Route("api/[controller]")]
[ApiController]
public class UserController
{
    [HttpGet("/use")]
    public string printer()
    {
        return "hahaha this is being called";
    }
}