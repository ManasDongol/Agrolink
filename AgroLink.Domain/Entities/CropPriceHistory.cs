using System.ComponentModel.DataAnnotations;

namespace AgroLink.Domain.Entities;

public class CropPriceHistory
{
    [Key]
    public int CropPriceHistoryID { get; set; }
    public String CropPriceHistoryJson { get; set; }
}