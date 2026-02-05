using System.Text;
using HtmlAgilityPack;
using AgroLink.Application.DTOs;

namespace AgroLink.Application.Services;

public class WebscraperService
{
    public List<WebscraperDataDto> WebscraperData { get; set; }=  new List<WebscraperDataDto>();
    public async Task<List<WebscraperDataDto>>  webscraper()
    {
        Console.OutputEncoding = Encoding.UTF8;

        var url = "https://ramropatro.com/vegetable";
        var client = new HttpClient();
        var html = await client.GetStringAsync(url);

        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        // find table by checking that it contains headers
        var table = doc.DocumentNode.SelectSingleNode(
            "//table[.//th[contains(., 'Commodity')] and .//th[contains(., 'Minimum')]]"
        );

        if (table == null)
        {
            Console.WriteLine("Could not find table!");
            return WebscraperData;
        }

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
                Console.WriteLine(
                    $"{cols[0].InnerText.Trim()} | {cols[1].InnerText.Trim()} | {cols[2].InnerText.Trim()} | {cols[3].InnerText.Trim()} | {cols[4].InnerText.Trim()}");
            
            }
        }
        
        Console.WriteLine("Done");
        return WebscraperData;
        
    }
}