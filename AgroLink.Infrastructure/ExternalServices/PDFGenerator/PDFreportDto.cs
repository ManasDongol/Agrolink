namespace Agrolink.Infrastructure.ExternalServices.PDFGenerator;

public class PDFreportDto
{
    public int N { get; set; }
    public int P { get; set; }
    public int K { get; set; }
    public int Rainfall { get; set; }
    public int Humidity { get; set; }
    public int Temperature { get; set; }
    public int Ph { get; set; }
    public string Crop { get; set; } = "";
    public string Fertilizer { get; set; } = "";

}