using AgroLink.Application.DTOs.Network;
using AgroLink.Application.Services;

namespace AgroLink.Application.Interfaces;

public interface INetworkService
{
    Task<NetworkPageDto> GetNetworkPageAsync(Guid currentUserId, string? username, string? role, int page, int pageSize);
    Task<SendConnectionRequestResponseDto> SendConnectionRequestAsync(Guid currentUserId, Guid targetUserId);
    Task<bool> AcceptConnectionRequestAsync(Guid currentUserId, Guid requestId);
    public Task<bool> WithdrawConnectionRequestAsync(Guid currentUserId, Guid requestId);
}
