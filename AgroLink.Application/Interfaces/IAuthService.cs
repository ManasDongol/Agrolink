using AgroLink.Application.DTOs;
using AgroLink.Application.DTOs.Emails;

namespace AgroLink.Application.Services;

public interface IAuthService
{
    public Task<LoginResponseDto?> LoginUser(LoginRequestDto dto);
    public Task<RegisterResponseDto> RegisterUser(RegisterRequestDto dto);

    public Task ForgotPasswordAsync(string email);
    public Task<bool> ResetPassword(ResetPasswordDto dto);
}