using AgroLink.Application.DTOs.Network;

namespace AgroLink.Application.Interfaces;

public interface INetworkService
{
    Task<NetworkPageDto> GetNetworkPageAsync(Guid currentUserId, string? username, string? role, int page, int pageSize);
    Task<bool> SendConnectionRequestAsync(Guid currentUserId, Guid targetUserId);
    Task<bool> AcceptConnectionRequestAsync(Guid currentUserId, Guid requestId);
}
