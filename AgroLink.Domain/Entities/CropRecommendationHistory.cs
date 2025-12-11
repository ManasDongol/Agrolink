using System.ComponentModel.DataAnnotations;

namespace AgroLink.Domain.Entities;

public class CropRecommendationHistory
{
    [Key]
    public int RecommendationID { get; set; }
    
    public Guid UserID { get; set; }
    public String RecommendationJson { get; set; }
    public User User { get; set; }
}