using Microsoft.AspNetCore.Mvc;
namespace Controllers;


[Route("api/[controller]")]
[ApiController]
public class UserController
{
    [HttpGet("/user")]
    public string printer()
    {
        return "hahaha this is being called";
    }

    [HttpPost("/user")]
    public void user()
    {
        
    }
}