using AgroLink.Application.DTOs.Network;
using AgroLink.Application.Interfaces;
using AgroLink.Infrastructure.Data;
using AgroLink.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.Application.Services;

public class NetworkService(AgroLinkDbContext context) : INetworkService
{
    public async Task<NetworkPageDto> GetNetworkPageAsync(Guid currentUserId, string? username, string? role, int page, int pageSize)
    {
        // 1. Get Current User Profile Stats
        var myProfile = await context.Profiles
            .Where(p => p.UserId == currentUserId)
            .Select(p => new ProfileStatsDto
            {
                Name = p.FirstName + " " + p.LastName,
                Role = p.Role,
                ProfilePicture = p.ProfilePicture,
                ConnectionCount = context.Connections.Count(c => c.UserID == currentUserId || c.ConnectionUserId == currentUserId),
                RequestCount = context.ConnectionRequests.Count(c => c.ConnectionUserId == currentUserId && !c.Accepted)
            })
            .FirstOrDefaultAsync();

        if (myProfile == null)
            myProfile = new ProfileStatsDto { Name = "Unknown", Role = "Guest" }; 

        // 2. Get Requests
        var requests = await context.ConnectionRequests
            .Where(r => r.ConnectionUserId == currentUserId && !r.Accepted)
            .Include(r => r.User) 
            .ThenInclude(u => u.Profile)
            .Select(r => new ConnectionRequestDto
            {
                RequestId = r.ConnectionRequestID,
                FromUserId = r.UserID,
                FromUserName = r.User.Profile != null ? r.User.Profile.FirstName + " " + r.User.Profile.LastName : r.User.Username,
                FromUserRole = r.User.Profile != null ? r.User.Profile.Role : "User",
                FromUserProfilePicture = r.User.Profile != null ? r.User.Profile.ProfilePicture : "",
                SentDate = r.SentDate
            })
            .ToListAsync();

        // 3. Get Users (Grid)
        var query = context.Users
            .Include(u => u.Profile)
            .Where(u => u.UserId != currentUserId);

        if (!string.IsNullOrEmpty(username))
            query = query.Where(u => u.Username.Contains(username) || 
                                     (u.Profile != null && (u.Profile.FirstName.Contains(username) || u.Profile.LastName.Contains(username))));

        if (!string.IsNullOrEmpty(role))
            query = query.Where(u => u.Profile != null && u.Profile.Role.Contains(role));

        var totalUsers = await query.CountAsync();
        
        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new NetworkUserDto
            {
                UserId = u.UserId,
                Username = u.Profile != null ? u.Profile.FirstName + " " + u.Profile.LastName : u.Username,
                Role = u.Profile != null ? u.Profile.Role : "User",
                ProfilePicture = u.Profile != null ? u.Profile.ProfilePicture : "",
                IsConnected = context.Connections.Any(c => (c.UserID == currentUserId && c.ConnectionUserId == u.UserId) || (c.UserID == u.UserId && c.ConnectionUserId == currentUserId)),
                IsRequestSent = context.ConnectionRequests.Any(r => r.UserID == currentUserId && r.ConnectionUserId == u.UserId && !r.Accepted),
                IsRequestReceived = context.ConnectionRequests.Any(r => r.UserID == u.UserId && r.ConnectionUserId == currentUserId && !r.Accepted)
            })
            .ToListAsync();

        return new NetworkPageDto
        {
            MyProfile = myProfile,
            Requests = requests,
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

        bool pending = await context.ConnectionRequests.AnyAsync(r => (r.UserID == currentUserId && r.ConnectionUserId == targetUserId) && !r.Accepted);
        if (pending) return false;

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
        return true;
    }
}
