using AgroLink.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace AgroLink.API.Hubs.HubService;

    public class SignalRNotificationPusher(IHubContext<NotificationHub> _hub) : INotificationPusher
    {
        public Task PushAsync(Guid userId, object payload)
            => _hub.Clients.Group(userId.ToString()).SendAsync("ReceiveNotification", payload);
    }
