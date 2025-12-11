using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgroLink.Domain.Entities;


public class Profile
{
    [Key]
    public Guid ProfileId { get; set; }
    
    [ForeignKey("UserId")]
    public Guid UserId { get; set; }
    
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
    
    
    //nav properties 
    public User User { get; set; }
}