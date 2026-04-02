namespace AgroLink.Application.DTOs.Network;

public class SentRequestDto
{
    public Guid RequestId { get; set; }
    public Guid ToUserId { get; set; }
    public string ToUserName { get; set; }
    public string ToUserRole { get; set; }
    public string ToUserProfilePicture { get; set; }
    public DateTime SentDate { get; set; }
}

    