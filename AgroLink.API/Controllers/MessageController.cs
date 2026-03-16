using AgroLink.Application.Services;
using AgroLink.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace AgroLink.API.Controllers;

public class MessageController(MessageService service)
{
    [HttpGet]
    public void getConversations([FromRoute]string id)
    {
       
    }
    
    [HttpGet]
    public IEnumerable<Connections> GetConnections([FromRoute]string id)
    {
        return service.getConnections(id);
    }

    [HttpGet]
    public void getMessages()
    {
        
    }
}