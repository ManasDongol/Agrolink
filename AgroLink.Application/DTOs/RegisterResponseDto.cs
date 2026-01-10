namespace AgroLink.Application.DTOs;

public record RegisterResponseDto(
    RegisterRequestDto RegisterRequest,
    Guid userID,
    string Message
    );