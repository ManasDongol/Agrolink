using System.ComponentModel.DataAnnotations;

namespace AgroLink.Domain.Entities;

public class User
{
    [Key]
    public Guid UserId { get; set; } = Guid.NewGuid();
    public string Username { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
   
    public Profile ProfileID { get; set; }
   
}