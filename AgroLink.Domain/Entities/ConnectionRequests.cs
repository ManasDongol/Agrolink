using System.ComponentModel.DataAnnotations;

namespace AgroLink.Domain.Entities;

public class ConnectionRequests
{
    [Key]
    public Guid ConnectionRequestID { get; set; }
    public Guid UserID { get; set; }
    public Guid ConnectionUserId { get; set; }
    public DateTime SentDate { get; set; }
    public Boolean Accepted { get; set; } = false;
    public User User { get; set; }
}