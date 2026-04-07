using AgroLink.Application.Interfaces;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using AgroLink.Infrastructure.Repositories;
using Microsoft.AspNetCore.SignalR;

namespace AgroLink.Application.Services;


 
        public class NotificationService(NotificationsRepo _repo, INotificationPusher _pusher)
            : INotificationService
        {
            public async Task SendNotificationAsync(Guid recipientUserId, string message, Guid? senderUserId = null)
            {
                var notification = new Notification
                {
                    RecipientUserId = recipientUserId,
                    SenderUserId = senderUserId,
                    Message = message,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                // 1. Save to DB first so it gets an Id
                await _repo.SendNotificationAsync(notification);

                // 2. Push to frontend via SignalR
                await _pusher.PushAsync(recipientUserId, new
                {
                    notification.Id,
                    notification.Message,
                    notification.IsRead,
                    notification.CreatedAt
                });
            }

            public Task<IEnumerable<Notification>> GetNotificationsAsync(Guid userId)
                => _repo.GetNotificationsAsync(userId);

            public Task<int> GetUnreadCountAsync(Guid userId)
                => _repo.GetUnreadCountAsync(userId);

            public Task MarkReadAsync(Guid notificationId, Guid userId)
                => _repo.MarkReadAsync(notificationId, userId);

            public Task MarkAllReadAsync(Guid userId)
                => _repo.MarkAllReadAsync(userId);
        }
