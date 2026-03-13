using Microsoft.AspNetCore.SignalR;

namespace AgroLink.API.Hubs;

public class ChatHub: Hub
{
    public async Task SendMessage(string receiverId, string message)
    {
        await Clients.User(receiverId)
            .SendAsync("ReceiveMessage", message);
    }
}