namespace AgroLink.Application.DTOs;

public record ProfileResponseDto
    (
    Guid ProfileId,
    Guid UserId,
    string FirstName,
    string LastName,
    string Role,
    string Address,
    string PhoneNumber,
    string ProfilePicture,
    string ProfileBackground,
    string Description,
    string Achievement
    );