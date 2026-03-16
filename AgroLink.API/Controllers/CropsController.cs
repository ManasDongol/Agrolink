using AgroLink.Application.DTOs;
using AgroLink.Application.Interfaces;
using AgroLink.Application.Services;
using Agrolink.Infrastructure.ExternalServices.PDFGenerator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        var fastApiRequest = new CropRequest
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
        //  Python FastAPI
        var response = await _httpClient.PostAsJsonAsync(
            "http://127.0.0.1:8000/predict", fastApiRequest
        );

        if (!response.IsSuccessStatusCode)
            return StatusCode(500, "Prediction failed");

        var result = await response.Content.ReadFromJsonAsync<CropResponseDto>();
        if (result != null)
        {
            var CropName = _cropService.cropName(result.Crop);
            var FertilizerName = _cropService.fertilizerName(result.Fertilizer);
            Console.WriteLine(CropName);
            Console.WriteLine(FertilizerName);
            return Ok(new
                {
                    crop = CropName,
                    fertilizer = FertilizerName
                    
                }
            
            );
        }
        return StatusCode(500, "Prediction failed");

         
       
    }
}

public class CropRequest
{
    public List<float> features { get; set; }
}

public class CropResponse
{
    public int Prediction { get; set; }
}