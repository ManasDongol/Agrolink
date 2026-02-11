namespace AgroLink.Application.DTOs.Network;

public class ConnectionRequestDto
{
    public Guid RequestId { get; set; }
    public Guid FromUserId { get; set; }
    public string FromUserName { get; set; }
    public string FromUserRole { get; set; }
    public string FromUserProfilePicture { get; set; }
    public DateTime SentDate { get; set; }
}
