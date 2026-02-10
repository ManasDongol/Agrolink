using System.Text;
using HtmlAgilityPack;
using AgroLink.Application.DTOs;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace AgroLink.Application.Services;

public class WebscraperService(IDistributedCache _cache)
{
    public List<WebscraperDataDto> WebscraperData { get; set; }=  new List<WebscraperDataDto>();
    public async Task<List<WebscraperDataDto>>  webscraper()
    {
        Console.OutputEncoding = Encoding.UTF8;
        const string key = "vegetable-prices";
        var url = "https://ramropatro.com/vegetable";
        var client = new HttpClient();
        var html = await client.GetStringAsync(url);

        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        // find table by checking that it contains headers
        var table = doc.DocumentNode.SelectSingleNode(
            "//table[.//th[contains(., 'Commodity')] and .//th[contains(., 'Minimum')]]"
        );
/*
        if (table == null)
        {
            Console.WriteLine("Could not find table!");
           
            var cachedJson = await _cache.GetStringAsync(key);

            if (cachedJson != null)
            {
                var prices =
                    JsonSerializer.Deserialize<List<WebscraperDataDto>>(cachedJson);

                return prices!;
            }
            
            return WebscraperData;
        }*/

        var rows = table.SelectNodes(".//tr");
        if (rows == null)
        {
            Console.WriteLine("No rows found!");
            return WebscraperData;
        }

        foreach (var row in rows.Skip(1)) // skip header row
        {
            var cols = row.SelectNodes("td");
            if (cols != null && cols.Count >= 5)
            {
                var currentrow = new  WebscraperDataDto
                {
                    Commodity = cols[0].InnerText.Trim(),
                    Minimum = cols[2].InnerText.Trim(),
                    Maximum = cols[3].InnerText.Trim(),
                    Average = cols[4].InnerText.Trim(),
                    Unit = cols[1].InnerText.Trim()
                };
                WebscraperData.Add(currentrow);
             
            }
        }
/*
        try
        {
            var json = JsonSerializer.Serialize(WebscraperData);
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(2)
            };

            await _cache.SetStringAsync(key, json, options);
        }
        catch(Exception e )
        {
            Console.WriteLine("errorororor");
            return WebscraperData;
        }
        
        */
        return WebscraperData;
        
    }
    
    
    public async Task<List<WebscraperDataDto>> FindCrop(string value)
    {
        var cachedList = await webscraper()?? new List<WebscraperDataDto>();

        if (string.IsNullOrWhiteSpace(value))
            return cachedList;

        var newList = cachedList
            .Where(x =>
                !string.IsNullOrEmpty(x.Commodity) &&
                x.Commodity.Contains(value, StringComparison.OrdinalIgnoreCase))
            .ToList();

        return newList;
    }

}