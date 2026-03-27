namespace AgroLink.Application.DTOs.Network;

public class ConnectionsDto
{
    public Guid SenderID { get; set; }
    public Guid ReceiverID { get; set; }
    public string SenderName { get; set; }
    public string ReceiverName { get; set; }
    public string SenderProfileURL { get; set; }
    public string ReceiverProfileURL { get; set; }
}