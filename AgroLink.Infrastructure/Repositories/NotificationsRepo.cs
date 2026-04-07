using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.Infrastructure.Repositories;

public class NotificationsRepo(AgroLinkDbContext _context)
{
      public async Task SendNotificationAsync(
            Notification notification)
        {
 
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
 
           
        }
 
        public async Task<IEnumerable<Notification>> GetNotificationsAsync(Guid userId)
        {
            return await _context.Notifications
                .Where(n => n.RecipientUserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(20)
                .ToListAsync();
        }
 
        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.RecipientUserId == userId && !n.IsRead);
        }
 
        public async Task MarkReadAsync(Guid notificationId, Guid userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.RecipientUserId == userId);
 
            if (notification != null)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();
            }
        }
 
        public async Task MarkAllReadAsync(Guid userId)
        {
            var unread = await _context.Notifications
                .Where(n => n.RecipientUserId == userId && !n.IsRead)
                .ToListAsync();
 
            unread.ForEach(n => n.IsRead = true);
            await _context.SaveChangesAsync();
        }
}