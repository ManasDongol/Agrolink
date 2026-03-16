using Microsoft.AspNetCore.Identity.Data;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace  Agrolink.Infrastructure.ExternalServices.PDFGenerator
{
    public class PDFservice
    {
         public byte[] GenerateCropReport(PDFreportDto report)
    {
        string path = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.Desktop),
            $"AgroLink-CropReport-{DateTime.Now:yyyyMMddHHmm}.pdf"
        );
        using var stream = new MemoryStream();

        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);

                // HEADER
                page.Header().Column(col =>
                {
                    col.Item().Text("AgroLink Agricultural Analysis Report")
                        .SemiBold()
                        .FontSize(24)
                        .FontColor(Colors.Green.Darken2);

                    col.Item().Text($"Generated on: {DateTime.Now:g}")
                        .FontSize(10)
                        .FontColor(Colors.Grey.Darken1);

                    col.Item().LineHorizontal(1);
                });

                // CONTENT
                page.Content().Column(col =>
                {
                    col.Spacing(20);

                    // SECTION TITLE
                    col.Item().Text("Environmental and Soil Parameters")
                        .SemiBold()
                        .FontSize(16);

                    // DATA TABLE
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Cell().Element(CellStyle).Text("Nitrogen (N)");
                        table.Cell().Element(CellStyle).Text(report.N.ToString());

                        table.Cell().Element(CellStyle).Text("Phosphorus (P)");
                        table.Cell().Element(CellStyle).Text(report.P.ToString());

                        table.Cell().Element(CellStyle).Text("Potassium (K)");
                        table.Cell().Element(CellStyle).Text(report.K.ToString());

                        table.Cell().Element(CellStyle).Text("Rainfall (mm)");
                        table.Cell().Element(CellStyle).Text(report.Rainfall.ToString());

                        table.Cell().Element(CellStyle).Text("Humidity (%)");
                        table.Cell().Element(CellStyle).Text(report.Humidity.ToString());

                        table.Cell().Element(CellStyle).Text("Temperature (°C)");
                        table.Cell().Element(CellStyle).Text(report.Temperature.ToString());

                        table.Cell().Element(CellStyle).Text("Soil pH");
                        table.Cell().Element(CellStyle).Text(report.Ph.ToString());
                    });

                    col.Item().LineHorizontal(1);

                    // CROP RESULT
                    col.Item().Text("Recommended Crop")
                        .SemiBold()
                        .FontSize(16);

                    col.Item().Background(Colors.Green.Lighten4).Padding(10).Text(
                        $"Based on the analysed soil nutrients and environmental conditions, the most suitable crop for cultivation is: {report.Crop}."
                    );

                    // FERTILIZER
                    col.Item().Text("Fertilizer Recommendation")
                        .SemiBold()
                        .FontSize(16);

                    col.Item().Background(Colors.Grey.Lighten3).Padding(10).Text(
                        $"Recommended fertilizer for optimal yield: {report.Fertilizer}."
                    );

                    // NOTE
                    col.Item().LineHorizontal(1);

                    col.Item().Text("Advisory Note")
                        .SemiBold()
                        .FontSize(14);

                    col.Item().Text(
                        "This recommendation is generated using AgroLink's predictive agricultural model. " +
                        "Farmers are advised to consider additional local environmental factors and consult agricultural experts before final implementation."
                    )
                    .FontSize(11);
                });

                // FOOTER
                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("AgroLink • Smart Agricultural Advisory System | Page ");
                        x.CurrentPageNumber();
                    });
            });
        })
        .GeneratePdf(stream);

        return stream.ToArray();



    }

         
    static IContainer CellStyle(IContainer container)
    {
        return container
            .PaddingVertical(6)
            .PaddingHorizontal(4)
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten2);
    }
    }
}

