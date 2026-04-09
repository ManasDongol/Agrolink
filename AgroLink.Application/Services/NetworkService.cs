using AgroLink.Application.DTOs.Network;
using AgroLink.Application.Interfaces;
using AgroLink.Infrastructure.Data;
using AgroLink.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.Application.Services;

public class NetworkService(AgroLinkDbContext context,INotificationService _notifications) : INetworkService
{
  public async Task<NetworkPageDto> GetNetworkPageAsync(
    Guid currentUserId,
    string? username,
    string? role,
    int page,
    int pageSize)
{
    // . My Profile
    var myProfile = await context.Profiles
        .Where(p => p.UserId == currentUserId)
        .Select(p => new ProfileStatsDto
        {
            Name = p.FirstName + " " + p.LastName,
            Role = p.Role,
            ProfilePicture = p.ProfilePicture,
            ConnectionCount = context.Connections.Count(c =>
                c.UserID == currentUserId || c.ConnectionUserId == currentUserId),
            RequestCount = context.ConnectionRequests.Count(c =>
                c.ConnectionUserId == currentUserId && !c.Accepted)
        })
        .FirstOrDefaultAsync();

    if (myProfile == null)
        myProfile = new ProfileStatsDto { Name = "Unknown", Role = "Guest" };


    //  Connection Requests (received)
    var requests = await context.ConnectionRequests
        .Where(r => r.ConnectionUserId == currentUserId && !r.Accepted)
        .Include(r => r.User)
        .ThenInclude(u => u.Profile)
        .Select(r => new ConnectionRequestDto
        {
            RequestId = r.ConnectionRequestID,
            FromUserId = r.UserID,
            FromUserName = r.User.Profile != null
                ? r.User.Profile.FirstName + " " + r.User.Profile.LastName
                : r.User.Username,
            FromUserRole = r.User.Profile != null
                ? r.User.Profile.Role
                : "User",
            FromUserProfilePicture = r.User.Profile != null
                ? r.User.Profile.ProfilePicture
                : "",
            SentDate = r.SentDate
        })
        .ToListAsync();

    // ConnectionRequests (Sent)
    
    var SentRequests = await context.ConnectionRequests
        .Where(u=>u.UserID == currentUserId && !u.Accepted)
        .Include(r => r.ConnectionUser)
        .ThenInclude(u => u.Profile)
        .Select(r => new SentRequestDto
        {
            RequestId = r.ConnectionRequestID,
            ToUserId =r.ConnectionUserId,
            ToUserName = r.ConnectionUser.Profile != null
                ? r.ConnectionUser.Profile.FirstName + " " + r.ConnectionUser.Profile.LastName
                : r.ConnectionUser.Username,
            ToUserRole = r.ConnectionUser.Profile != null
                ? r.ConnectionUser.Profile.Role
                : "User",
            ToUserProfilePicture = r.ConnectionUser.Profile != null
                ? r.ConnectionUser.Profile.ProfilePicture
                : "",
            SentDate = r.SentDate
        })
        .ToListAsync();


    var connectedUserIds = await context.Connections
        .Where(c => c.UserID == currentUserId || c.ConnectionUserId == currentUserId)
        .Select(c => c.UserID == currentUserId
            ? c.ConnectionUserId
            : c.UserID)
        .ToListAsync();


    // Precompute requests
    var sentRequests = await context.ConnectionRequests
        .Where(r => r.UserID == currentUserId && !r.Accepted)
        .Select(r => r.ConnectionUserId)
        .ToListAsync();

    var receivedRequests = await context.ConnectionRequests
        .Where(r => r.ConnectionUserId == currentUserId && !r.Accepted)
        .Select(r => r.UserID)
        .ToListAsync();


    // 🔹 5. Base Query (ONE clean query)
    var query = context.Users
        .Include(u => u.Profile)
        .Where(u =>
            u.UserId != currentUserId &&
            u.Profile != null &&
            u.Profile.Role != "Admin" &&
            !connectedUserIds.Contains(u.UserId)
        );


    if (!string.IsNullOrEmpty(username))
    {
        var search = username.ToLower();

        query = query.Where(u =>
            u.Username.ToLower().Contains(search) ||
            (u.Profile.FirstName + " " + u.Profile.LastName).ToLower().Contains(search) ||
            u.Profile.Role.ToLower().Contains(search)
        );
    }


    var totalUsers = await query.CountAsync();

    var users = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(u => new NetworkUserDto
        {
            UserId = u.UserId,
            Username = u.Profile.FirstName + " " + u.Profile.LastName,
            Role = u.Profile.Role,
            ProfilePicture = u.Profile.ProfilePicture,

            // Fast lookups (no DB hit)
            IsConnected = false,
            IsRequestSent = sentRequests.Contains(u.UserId),
            IsRequestReceived = receivedRequests.Contains(u.UserId)
        })
        .ToListAsync();



    return new NetworkPageDto
    {
        MyProfile = myProfile,
        Requests = requests,
        SentRequests = SentRequests,
        Users = users,
        TotalUsers = totalUsers,
        CurrentPage = page,
        TotalPages = (int)Math.Ceiling(totalUsers / (double)pageSize)
    };
}
    public async Task<bool> SendConnectionRequestAsync(Guid currentUserId, Guid targetUserId)
    {
        bool exists = await context.Connections.AnyAsync(c => (c.UserID == currentUserId && c.ConnectionUserId == targetUserId) || (c.UserID == targetUserId && c.ConnectionUserId == currentUserId));
        if (exists) return false;

        var reverseRequest = await context.ConnectionRequests.FirstOrDefaultAsync(r => 
            r.UserID == targetUserId && 
            r.ConnectionUserId == currentUserId && 
            !r.Accepted);

        if (reverseRequest != null)
        {
            // Auto-connect — accept the reverse request instead of creating a new one
            reverseRequest.Accepted = true;

            context.Connections.Add(new Connections
            {
                UserID = currentUserId,
                ConnectionUserId = targetUserId,
            });

            context.ConnectionRequests.Remove(reverseRequest);
            await context.SaveChangesAsync();
            return true; // autoConnected = true
        }

        var request = new ConnectionRequests
        {
             ConnectionRequestID = Guid.NewGuid(),
             UserID = currentUserId,
             ConnectionUserId = targetUserId,
             SentDate = DateTime.UtcNow,
             Accepted = false
        };
        
        context.ConnectionRequests.Add(request);
        await context.SaveChangesAsync();
        
        var user = await context.Users.FirstOrDefaultAsync(u => u.UserId == currentUserId);
        if (user != null)
        {
            _notifications.SendNotificationAsync(
                recipientUserId: targetUserId,
                message: $"{user.Username} sent you a connection request!",
                senderUserId: currentUserId
            );
        }
       
        return true;
    }

    public async Task<bool> AcceptConnectionRequestAsync(Guid currentUserId, Guid requestId)
    {
        var request = await context.ConnectionRequests.FirstOrDefaultAsync(r => r.ConnectionRequestID == requestId && r.ConnectionUserId == currentUserId);
        if (request == null) return false;

        request.Accepted = true;
        
        var connection = new Connections
        {
            UserID = request.UserID, 
            ConnectionUserId = currentUserId, 
            AceeptedDate = DateTime.UtcNow
        };
        
        context.Connections.Add(connection);
        await context.SaveChangesAsync();
        
        
        var user = await context.Users.FirstOrDefaultAsync(u => u.UserId == currentUserId);
          if (user != null)
        {
            _notifications.SendNotificationAsync(
                recipientUserId: request.UserID,
                message: $"{user.Username} accepted your connection request!",
                senderUserId: currentUserId
            );
        }
        return true;
    }
    
    public async Task<bool> RejectConnectionRequestAsync(Guid currentUserId, Guid requestId)
    {
        var request = await context.ConnectionRequests
            .FirstOrDefaultAsync(r => r.ConnectionRequestID == requestId 
                                      && r.ConnectionUserId == currentUserId);

        if (request == null) return false;

        context.ConnectionRequests.Remove(request);

        await context.SaveChangesAsync();
        return true;
    }

    public async Task<List<ConnectionListDto>> GetConnectionList(Guid currentUserId)
    {
        var connectionList = await context.Connections
            .Where(c => c.UserID == currentUserId || c.ConnectionUserId == currentUserId)
            .Select(c => new ConnectionListDto
            {
                ConnectedUserID = c.UserID == currentUserId 
                    ? c.ConnectionUserId 
                    : c.UserID,

                ConnectedUserName = c.UserID == currentUserId
                    ? c.ConnectionUser.Username
                    : c.User.Username,

                ConnectedProfileUrl = c.UserID == currentUserId
                    ? c.ConnectionUser.Profile != null 
                        ? c.ConnectionUser.Profile.ProfilePicture
                        : ""
                    : c.User.Profile != null
                        ? c.User.Profile.ProfilePicture
                        : ""
            })
            .ToListAsync();

        return connectionList;
    }
    
    public async Task<bool> WithdrawConnectionRequestAsync(Guid currentUserId, Guid requestID)
    {
        var request = await context.ConnectionRequests
            .FirstOrDefaultAsync(r => r.ConnectionRequestID == requestID 
                                      && r.UserID == currentUserId 
                                      && !r.Accepted);

        if (request == null) return false;

        context.ConnectionRequests.Remove(request);
        await context.SaveChangesAsync();
        return true;
    }
    public async Task<bool> WithdrawConnectionRequestByReceiverAsync(Guid currentUserId, Guid receiverID)
    {
        var request = await context.ConnectionRequests
            .FirstOrDefaultAsync(r => r.ConnectionUserId == receiverID 
                                      && r.UserID == currentUserId 
                                      && !r.Accepted);

        if (request == null) return false;

        context.ConnectionRequests.Remove(request);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteConnection(Guid currentUserId, Guid connectedUserId)
    {
        var request = await context.Connections
            .FirstOrDefaultAsync(r => r.ConnectionUserId == connectedUserId && r.UserID == currentUserId || r.ConnectionUserId == currentUserId && r.UserID == connectedUserId);
        if (request == null) return false;
        
        var conversation = await context.Conversations
            .FirstOrDefaultAsync(r => r.User1Id == connectedUserId && r.User2Id == currentUserId || r.User1Id == currentUserId && r.User2Id == connectedUserId);

        
        context.Connections.Remove(request);
        if (conversation != null)
        {
            context.Conversations.Remove(conversation);
        }
        context.Connections.Remove(request);
        await context.SaveChangesAsync();
        return true;
    }
}
