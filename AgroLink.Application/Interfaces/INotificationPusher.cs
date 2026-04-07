namespace AgroLink.Application.Interfaces;


public interface INotificationPusher
{
    Task PushAsync(Guid userId, object payload);
}
