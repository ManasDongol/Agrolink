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
        AutomaticDecompression = System.Net.DecompressionMethods.GZip |
                                  System.Net.DecompressionMethods.Deflate,

        ServerCertificateCustomValidationCallback =
            HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
    })
    {
        Timeout = TimeSpan.FromSeconds(10)
    };

    private readonly IDistributedCache _cache;
    private readonly IWebHostEnvironment _env;

    private const string CacheKey = "crop_prices";
    private const string FallbackFileName = "crop_prices.json";

    public WebscraperService(IDistributedCache cache, IWebHostEnvironment env)
    {
        _cache = cache;
        _env = env;
    }

    // ===================== PUBLIC API =====================

    public async Task<List<WebscraperDataDto>> GetCropPrices()
    {
        // 1. Try Redis (FAST PATH)
        var redisData = await TryGetFromRedis();
        if (redisData?.Count > 0)
        {
            TriggerBackgroundRefresh(); // update in background
            return redisData;
        }

        // 2. Try file fallback (FAST LOCAL)
        var fileData = await TryGetFromFile();
        if (fileData?.Count > 0)
        {
            TriggerBackgroundRefresh();
            return fileData;
        }

        // 3. LAST RESORT: background scrape + return empty instantly
        TriggerBackgroundRefresh();
        return new List<WebscraperDataDto>();
    }

    public async Task<List<WebscraperDataDto>> FindCrop(string value)
    {
        var data = await GetCropPrices();

        if (string.IsNullOrWhiteSpace(value))
            return data;

        return data
            .Where(x => !string.IsNullOrEmpty(x.Commodity) &&
                        x.Commodity.Contains(value, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    // ===================== BACKGROUND REFRESH =====================

    private void TriggerBackgroundRefresh()
    {
        _ = Task.Run(async () =>
        {
            try
            {
                var scraped = await ScrapeFromWeb();

                if (scraped.Count > 0)
                {
                    await TrySaveToRedis(scraped);
                    await SaveToFile(scraped);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Scraper BG] Failed: {ex.Message}");
            }
        });
    }

    // ===================== SCRAPING =====================

    private async Task<List<WebscraperDataDto>> ScrapeFromWeb()
    {
        const string url = "https://ramropatro.com/vegetable";

        var html = await _client.GetStringAsync(url);

        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var table = doc.DocumentNode.SelectSingleNode(
            "//table[.//th[contains(., 'Commodity')]]"
        );

        if (table == null) return new();

        var rows = table.SelectNodes(".//tr");
        if (rows == null) return new();

        var result = new List<WebscraperDataDto>();

        foreach (var row in rows.Skip(1))
        {
            var cols = row.SelectNodes("td");
            if (cols == null || cols.Count < 5) continue;

            result.Add(new WebscraperDataDto
            {
                Commodity = cols[0].InnerText.Trim(),
                Unit      = cols[1].InnerText.Trim(),
                Minimum   = cols[2].InnerText.Trim(),
                Maximum   = cols[3].InnerText.Trim(),
                Average   = cols[4].InnerText.Trim(),
            });
        }

        return result;
    }

    // ===================== CACHE (SAFE) =====================

    private async Task<List<WebscraperDataDto>?> TryGetFromRedis()
    {
        try
        {
            var cached = await _cache.GetStringAsync(CacheKey);

            if (string.IsNullOrWhiteSpace(cached))
                return null;

            return JsonSerializer.Deserialize<List<WebscraperDataDto>>(cached);
        }
        catch
        {
            // Redis DOWN → do NOT block request
            return null;
        }
    }

    private async Task<bool> TrySaveToRedis(List<WebscraperDataDto> data)
    {
        try
        {
            var json = JsonSerializer.Serialize(data);

            await _cache.SetStringAsync(
                CacheKey,
                json,
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(12)
                });

            return true;
        }
        catch
        {
            // Redis down → ignore
            return false;
        }
    }

    // ===================== FILE FALLBACK =====================

    private async Task<List<WebscraperDataDto>?> TryGetFromFile()
    {
        try
        {
            var path = GetFilePath();

            if (!File.Exists(path))
                return null;

            var json = await File.ReadAllTextAsync(path, Encoding.UTF8);

            return JsonSerializer.Deserialize<List<WebscraperDataDto>>(json);
        }
        catch
        {
            return null;
        }
    }

    private async Task SaveToFile(List<WebscraperDataDto> data)
    {
        try
        {
            var path = GetFilePath();

            Directory.CreateDirectory(Path.GetDirectoryName(path)!);

            var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            await File.WriteAllTextAsync(path, json, Encoding.UTF8);
        }
        catch
        {
            // file failure should never break system
        }
    }

    private string GetFilePath()
    {
        return Path.Combine(
            _env.WebRootPath,
            "uploads",
            "scraped",
            FallbackFileName
        );
    }
}