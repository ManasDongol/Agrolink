using System.ComponentModel.DataAnnotations;

namespace AgroLink.Domain.Entities;

public class Connections
{
    [Key]
    public int ConnectionID { get; set; }
    
    public Guid UserID { get; set; }
    public Guid ConnectionUserId { get; set; }
    public DateTime AceeptedDate { get; set; }
    
    public User User { get; set; }
}