namespace AgroLink.Application.DTOs.Network;

public class NetworkUserDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; }
    public string Role { get; set; }
    public string ProfilePicture { get; set; }
    public int ConnectionCount { get; set; }
    public bool IsConnected { get; set; }
    public bool IsRequestSent { get; set; }
    public bool IsRequestReceived { get; set; }
}
