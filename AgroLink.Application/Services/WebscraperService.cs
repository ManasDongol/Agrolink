using System.Text;
using System.Text.Json;
using HtmlAgilityPack;
using AgroLink.Application.DTOs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Distributed;

namespace AgroLink.Application.Services;

public class WebscraperService
{
    private static readonly HttpClient _client = new HttpClient(new HttpClientHandler
    {
        // TODO: Remove once ramropatro.com renews their SSL certificate
        ServerCertificateCustomValidationCallback =
            HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
    });

    private readonly IDistributedCache _cache;
    private readonly IWebHostEnvironment _env;

    // Redis key (InstanceName "AgroLink:" is prepended automatically → "AgroLink:crop_prices")
    private const string CacheKey = "crop_prices";

    // Path inside wwwroot/uploads/scraped/
    private const string FallbackFileName = "crop_prices.txt";

    public WebscraperService(IDistributedCache cache, IWebHostEnvironment env)
    {
        _cache = cache;
        _env = env;
    }

    public async Task<List<WebscraperDataDto>> webscraper()
    {
        Console.OutputEncoding = Encoding.UTF8;
        // ── 1. Try Redis cache ────────────────────────────────────────────
        try
        {
            var cached = await _cache.GetStringAsync(CacheKey);
            if (!string.IsNullOrEmpty(cached))
            {
                Console.WriteLine("[WebscraperService] Returning data from Redis cache.");
                return JsonSerializer.Deserialize<List<WebscraperDataDto>>(cached) ?? new();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WebscraperService] Redis read failed: {ex.Message}");
        }
   
        try
        {
            var scraped = await ScrapeFromWeb();

            if (scraped.Count > 0)
            {
                // Save to Redis (expires after 12 hours)
                await SaveToRedis(scraped);

                // Save to text file as last-known-good backup
                await SaveToFile(scraped);

                return scraped;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WebscraperService] Live scrape failed: {ex.Message}");
        }

      

     
        try
        {
            var fromFile = await LoadFromFile();
            if (fromFile.Count > 0)
            {
                Console.WriteLine("[WebscraperService] Returning data from fallback text file.");
                return fromFile;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WebscraperService] File fallback failed: {ex.Message}");
        }

        Console.WriteLine("[WebscraperService] All sources failed. Returning empty list.");
        return new();
    }

    public async Task<List<WebscraperDataDto>> FindCrop(string value)
    {
        // FindCrop automatically gets all fallbacks since it calls webscraper()
        var data = await webscraper();

        if (string.IsNullOrWhiteSpace(value))
            return data;

        return data
            .Where(x => !string.IsNullOrEmpty(x.Commodity) &&
                        x.Commodity.Contains(value, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    // ── Private Helpers ───────────────────────────────────────────────────

    private async Task<List<WebscraperDataDto>> ScrapeFromWeb()
    {
        const string url = "https://ramropatro.com/vegetable";

        var html = await _client.GetStringAsync(url);
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var table = doc.DocumentNode.SelectSingleNode(
            "//table[.//th[contains(., 'Commodity')] and .//th[contains(., 'Minimum')]]"
        );

        if (table == null)
        {
            Console.WriteLine("[WebscraperService] Could not find price table in HTML.");
            return new();
        }

        var rows = table.SelectNodes(".//tr");
        if (rows == null) return new();

        var result = new List<WebscraperDataDto>();

        foreach (var row in rows.Skip(1))
        {
            var cols = row.SelectNodes("td");
            if (cols != null && cols.Count >= 5)
            {
                result.Add(new WebscraperDataDto
                {
                    Commodity = cols[0].InnerText.Trim(),
                    Unit      = cols[1].InnerText.Trim(),
                    Minimum   = cols[2].InnerText.Trim(),
                    Maximum   = cols[3].InnerText.Trim(),
                    Average   = cols[4].InnerText.Trim(),
                });
            }
        }

        return result;
    }

    private async Task SaveToRedis(List<WebscraperDataDto> data)
    {
        var json = JsonSerializer.Serialize(data);
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(12)
        };
        await _cache.SetStringAsync(CacheKey, json, options);
        Console.WriteLine("[WebscraperService] Saved to Redis cache.");
    }

    private async Task SaveToFile(List<WebscraperDataDto> data)
    {
        var folderPath = Path.Combine(_env.WebRootPath, "uploads", "scraped");
        Directory.CreateDirectory(folderPath); // creates folder if it doesn't exist

        var filePath = Path.Combine(folderPath, FallbackFileName);
        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });

        await File.WriteAllTextAsync(filePath, json, Encoding.UTF8);
        Console.WriteLine($"[WebscraperService] Saved to fallback file: {filePath}");
    }

    private async Task<List<WebscraperDataDto>> LoadFromFile()
    {
        var filePath = Path.Combine(_env.WebRootPath, "uploads", "scraped", FallbackFileName);

        if (!File.Exists(filePath))
        {
            Console.WriteLine("[WebscraperService] Fallback file does not exist.");
            return new();
        }

        var json = await File.ReadAllTextAsync(filePath, Encoding.UTF8);
        return JsonSerializer.Deserialize<List<WebscraperDataDto>>(json) ?? new();
    }
}