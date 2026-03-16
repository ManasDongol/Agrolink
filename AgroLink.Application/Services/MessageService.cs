using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using AgroLink.Infrastructure.Repositories;

namespace AgroLink.Application.Services;

public class MessageService(MessagesRepo repo)
{
    public IEnumerable<Connections> getConnections(string id)
    {
        var conversations = repo.getConnections(id);
        return conversations;
    }

    public IEnumerable<Messages> getMessages(string conversatonID)
    {
        var conversations = repo.getMessages(conversatonID);
        return conversations;
    }
}