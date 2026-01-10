namespace AgroLink.Application.DTOs;

public record ProfileRequestDto
(
    Guid UserID,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string Address,
    string Role,
    string ProfilePicture,
    string ProfileBackgroundPicture,
    string  Description,
    string Achievement
); 
   
        
        
