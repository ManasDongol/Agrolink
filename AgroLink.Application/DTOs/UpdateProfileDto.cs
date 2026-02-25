namespace AgroLink.Application.DTOs;

public class UpdateProfileDto
{
    public string UserID { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Role { get; set; }
    public string Address { get; set; }
    public string PhoneNumber { get; set; }
    public string Achievement { get; set; }
    public string Description { get; set; }
}