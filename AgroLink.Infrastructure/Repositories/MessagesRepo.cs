using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;

namespace AgroLink.Infrastructure.Repositories;

public class MessagesRepo(AgroLinkDbContext _dbContext)
{
    public IEnumerable<Connections> getConnections(string id)
    {
         IEnumerable<Connections> connectionlist = _dbContext.Connections.Where(x => x.UserID == Guid.Parse(id));
         return connectionlist;
    }
    
}