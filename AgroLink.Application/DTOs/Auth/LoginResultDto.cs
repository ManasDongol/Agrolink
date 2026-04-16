namespace AgroLink.Application.DTOs.Auth;


public record LoginResult(LoginResponseDto? Response, string? Error);