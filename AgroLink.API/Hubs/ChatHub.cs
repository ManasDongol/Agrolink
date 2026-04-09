using AgroLink.Application.DTOs;
using Microsoft.AspNetCore.SignalR;

namespace AgroLink.API.Hubs;

public class ChatHub: Hub
{
    public Task Prac()
    {
      
        return Task.CompletedTask;
    }
    public async Task SendImage(string receiverId, string conversationId, string imageUrl)
    {
        Console.WriteLine("SendImage HIT");
        var messageDto = new NewMessageDto
        {
            ConversationId = conversationId,
            SenderId = Context.UserIdentifier,
            Content = imageUrl,
            Sent = DateTime.UtcNow,
            IsImage = true        
        };

        try
        {
            await Clients.User(receiverId).SendAsync("ReceiveImage", messageDto);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
    public async Task SendMessage(string receiverId,  string conversationId,string message)
    {
        Console.WriteLine(" SendMessage HIT");
        var messageDto = new NewMessageDto
        {
            ConversationId = conversationId,
            SenderId = Context.UserIdentifier,
            Content = message,
            Sent = DateTime.UtcNow
        };
        try
        {
           
            await Clients.User(receiverId)
                .SendAsync("ReceiveMessage", messageDto);
           
        }
        catch (Exception e)
        {
           Console.WriteLine(e);
           throw;
        }
        
    }
    public override Task OnConnectedAsync()
    {
        
        Console.WriteLine("UserIdentifier: " + Context.UserIdentifier);
        Console.WriteLine("User Authenticated: " + Context.User?.Identity?.IsAuthenticated);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? ex)
    {
        Console.WriteLine("Hub Disconnected: " + ex?.Message);
        return base.OnDisconnectedAsync(ex);
    }
}