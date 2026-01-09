namespace AgroLink.Application.DTOs;

public record RegisterResponseDto(
    RegisterRequestDto RegisterRequest,
    string Message
    );