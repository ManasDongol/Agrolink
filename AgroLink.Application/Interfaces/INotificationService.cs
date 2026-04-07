using AgroLink.Domain.Entities;

namespace AgroLink.Application.Interfaces;
public interface INotificationService
{
    Task SendNotificationAsync(Guid recipientUserId, string message, Guid? senderUserId = null);
    Task<IEnumerable<Notification>> GetNotificationsAsync(Guid userId);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task MarkReadAsync(Guid notificationId, Guid userId);
    Task MarkAllReadAsync(Guid userId);
}