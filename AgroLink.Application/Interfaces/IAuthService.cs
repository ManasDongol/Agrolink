using AgroLink.Application.DTOs;

namespace AgroLink.Application.Services;

public interface IAuthService
{
    public Task<LoginResponseDto?> LoginUser(LoginRequestDto dto);
    public Task<RegisterRequestDto> RegisterUser(RegisterRequestDto dto);
}