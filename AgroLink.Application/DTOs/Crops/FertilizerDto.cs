using System.Text.Json.Serialization;

namespace AgroLink.Application.DTOs.Crops;

public class FertilizerDto
{

    [JsonPropertyName("fertilizer")] public string Fertilizer { get; set; }

    [JsonPropertyName("fert_prob")] public float FertProb { get; set; }

    [JsonPropertyName("score")] public float Score { get; set; }
};