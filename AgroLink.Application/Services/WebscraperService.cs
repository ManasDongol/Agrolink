using System.Text;
using HtmlAgilityPack;
using AgroLink.Application.DTOs;

namespace AgroLink.Application.Services;

public class WebscraperService
{
    private static readonly HttpClient _client = new HttpClient(new HttpClientHandler
    {
        // TODO: Remove once ramropatro.com renews their SSL certificate
        ServerCertificateCustomValidationCallback =
            HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
    });

    public async Task<List<WebscraperDataDto>> webscraper()
    {
        Console.OutputEncoding = Encoding.UTF8;
        const string url = "https://ramropatro.com/vegetable";

        // --- Scrape ---
        var html = await _client.GetStringAsync(url);
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var table = doc.DocumentNode.SelectSingleNode(
            "//table[.//th[contains(., 'Commodity')] and .//th[contains(., 'Minimum')]]"
        );

        if (table == null)
        {
            Console.WriteLine("Could not find table!");
            return new();
        }

        var rows = table.SelectNodes(".//tr");
        if (rows == null)
        {
            Console.WriteLine("No rows found!");
            return new();
        }

        var webscraperData = new List<WebscraperDataDto>();

        foreach (var row in rows.Skip(1))
        {
            var cols = row.SelectNodes("td");
            if (cols != null && cols.Count >= 5)
            {
                webscraperData.Add(new WebscraperDataDto
                {
                    Commodity = cols[0].InnerText.Trim(),
                    Unit      = cols[1].InnerText.Trim(),
                    Minimum   = cols[2].InnerText.Trim(),
                    Maximum   = cols[3].InnerText.Trim(),
                    Average   = cols[4].InnerText.Trim(),
                });
            }
        }

        return webscraperData;
    }

    public async Task<List<WebscraperDataDto>> FindCrop(string value)
    {
        var data = await webscraper();

        if (string.IsNullOrWhiteSpace(value))
            return data;

        return data
            .Where(x => !string.IsNullOrEmpty(x.Commodity) &&
                        x.Commodity.Contains(value, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }
}