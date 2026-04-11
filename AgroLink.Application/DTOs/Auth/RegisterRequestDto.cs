namespace AgroLink.Application.DTOs;

public record RegisterRequestDto(
    string Username,
    string Password,
    string Email,
    string UserType
    );