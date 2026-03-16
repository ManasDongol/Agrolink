using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.Infrastructure.Repositories;

public class MessagesRepo(AgroLinkDbContext _dbContext)
{
    public IEnumerable<Connections> getConnections(string id)
    {
        IEnumerable<Connections> connectionlist = _dbContext.Connections.Where(x => x.UserID == Guid.Parse(id) || x.ConnectionUserId ==Guid.Parse(id)).ToList();
         return connectionlist;
    }

    public async Task<String> getConversations(string userid1, string userid2)
    {
        var conversation = await _dbContext.Conversations.FirstOrDefaultAsync(m=>m.User1Id == Guid.Parse(userid1) && m.User2Id == Guid.Parse(userid2) 
            || m.User1Id == Guid.Parse(userid2) && m.User2Id == Guid.Parse(userid1));
        
        return conversation.Id.ToString();
    }

    public IEnumerable<Messages> getMessages(string id)
    {
        var messageList = _dbContext.Messages.Where(x=>x.ConversationId == Guid.Parse(id)).ToList();
        return messageList;
    }
    
}