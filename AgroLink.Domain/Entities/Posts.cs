using System.ComponentModel.DataAnnotations;

namespace AgroLink.Domain.Entities;

public class Posts
{
    [Key]
    public Guid PostId { get; set; }
    
    public Guid UserId { get; set; }
    
    public string Title { get; set; }
    public string Content { get; set; }
    public bool? IsDeleted { get; set; }
    public DateTime Created { get; set; }
    public DateTime? Modified { get; set; }
    public DateTime? Deleted { get; set; }
    public bool? hasImage { get; set; }
    public string ImagePath { get; set; }
    
    //nav properties
    
    public User User { get; set; }
    
    
}