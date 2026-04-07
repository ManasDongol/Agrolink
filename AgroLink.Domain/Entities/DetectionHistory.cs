using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgroLink.Domain.Entities;

public class DetectionHistory
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
 
    [Required]
    public Guid UserId { get; set; }  // FK to your User/ApplicationUser
 
    [Required]
    public string ImageFileName { get; set; }  // stored filename (e.g. "guid.jpg")
 
    [Required]
    public string ImagePath { get; set; }      // full server path or relative URL
 
    [Required]
    public string PredictedClass { get; set; }       // clean label e.g. "Tomato - Late blight"
 
    [Required]
    public string PredictedClassRaw { get; set; }    // raw label e.g. "Tomato___Late_blight"
 
    [Required]
    public float Confidence { get; set; }            // e.g. 94.27
 
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
 
    public User User { get; set; }
}