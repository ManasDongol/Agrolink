namespace AgroLink.Application.DTOs;
public record LoginResponseDto(
    LoginRequestDto LoginRequest,
    string token,
    string Message
    );