using System.Text.Json.Serialization;

namespace AgroLink.Application.DTOs.Crops;

public class CropResponseDto
{

    [JsonPropertyName("crop")]
    public string Crop { get; set; }

    [JsonPropertyName("crop_prob")]
    public float CropProb { get; set; }

    [JsonPropertyName("yield_")]  // Python renames "yield" -> "yield_"
    public float Yield { get; set; }

    [JsonPropertyName("fertilizers")]
    public List<FertilizerDto> Fertilizers { get; set; }
}
