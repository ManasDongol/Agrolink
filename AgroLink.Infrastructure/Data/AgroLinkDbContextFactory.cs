using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AgroLink.Infrastructure.Data;

public class AgroLinkDbContextFactory : IDesignTimeDbContextFactory<AgroLinkDbContext>
{
    public AgroLinkDbContext CreateDbContext(string[] args) {
        var optionsBuilder = new DbContextOptionsBuilder<AgroLinkDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Database=Agrolink-db;Username=postgres;Password=Manas@2727");

        return new AgroLinkDbContext(optionsBuilder.Options);
    }
}

