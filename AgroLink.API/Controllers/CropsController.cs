using AgroLink.Application.DTOs;
using AgroLink.Application.DTOs.Crops;
using AgroLink.Application.Interfaces;
using AgroLink.Application.Services;
using Agrolink.Infrastructure.ExternalServices.PDFGenerator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CropResponseDto = AgroLink.Application.DTOs.Crops.CropResponseDto;

namespace Controllers;


[ApiController]
[Route("api/[controller]")]
public class CropsController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private ICropService _cropService;
    private WebscraperService _webscraperService;
    private PDFservice _pdfService;
    public CropsController(HttpClient httpClient, ICropService cropService,WebscraperService webscraperService,PDFservice pdfService )
    {
        _httpClient = httpClient;
        _cropService = cropService;
        _webscraperService = webscraperService;
        _pdfService = pdfService;
    }

    [HttpGet("prices")]
    public async Task<List<WebscraperDataDto>> GetPrices()
    {
        var prices = await _webscraperService.webscraper();
        return prices;
    }

    [HttpGet("cropName")]
    public async Task<List<WebscraperDataDto>> GetCrop([FromQuery] string name)
    {
        var prices = await _webscraperService.FindCrop(name);
        return prices;
    }
    
    [HttpPost("report")]
    public IActionResult GenerateCropReport([FromBody] PDFreportDto report)
    {
        Console.Write("hello" + report.Fertilizer);
        var pdfBytes = _pdfService.GenerateCropReport(report);

        return File(
            pdfBytes,
            "application/pdf",
            $"AgroLink-CropReport-{DateTime.Now:yyyyMMddHHmm}.pdf"
        );
    }
    
    [HttpPost("predict")]
    public async Task<IActionResult> Predict([FromBody] CropRequestDto request)
    {
        
        // Map request to Python FastAPI input
        var fastApiRequest = new
        {
            features = new List<float>
            {
                request.N,
                request.P,
                request.K,
                request.temperature,
                request.humidity,
                request.ph,
                request.rainfall
            }
        };
        Console.WriteLine($"Features sent to FastAPI: {string.Join(",", fastApiRequest.features)}");

        
        var response = await _httpClient.PostAsJsonAsync("http://127.0.0.1:8000/predict", fastApiRequest);

        if (!response.IsSuccessStatusCode)
            return StatusCode(500, "Prediction failed");

        // Deserialize into wrapper object
        var wrapper = await response.Content.ReadFromJsonAsync<CropApiResponse>();
        var results = wrapper?.Results ?? new List<CropResponseDto>();

        // Optional: map fertilizer names using _cropService
      /*  foreach (var crop in results)
        {
            if (crop.Fertilizers != null)
            {
                crop.Fertilizers = crop.Fertilizers
                    .Select(f => new  FertilizerDto(
                        f.Fertilizer,
                        f.FertProb,
                        f.Score
                    )).ToList();
            }
        }*/

        // Return full results to frontend
        return Ok(new { results });
    }
}

public class CropRequest
{
    public List<float> features { get; set; } = new List<float>();
}

public class CropResponse
{
    public int Prediction { get; set; }
}


// Wrapper for FastAPI response
public class CropApiResponse
{
    public List<CropResponseDto> Results { get; set; }
}