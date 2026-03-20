using System.ComponentModel.DataAnnotations;

namespace AgroLink.Domain.Entities;

public class Posts
{
    [Key]
    public Guid PostId { get; set; }
    
    public Guid UserId { get; set; }
    
    public string Title { get; set; }
    public string Content { get; set; }
    public DateTime Created { get; set; }
    public DateTime? Modified { get; set; }
    public bool? hasImage { get; set; }
    public string ImagePath { get; set; }
    
    public string PostCategory { get; set; }
    //nav properties
    
    public User User { get; set; }
    
    public ICollection<Comment> Comments { get; set; }  = new List<Comment>();
    public ICollection<Like> Likes { get; set; }= new List<Like>();
    public ICollection<Bookmark> Bookmarks { get; set; } = new  List<Bookmark>();
    
    
}