namespace AgroLink.Application.DTOs;

public record AuthResponseDto(
    String AccessToken,
    String RefreshToken
    
    );