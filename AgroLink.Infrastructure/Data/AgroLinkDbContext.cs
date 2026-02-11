using AgroLink.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.Infrastructure.Data;

public class AgroLinkDbContext(DbContextOptions<AgroLinkDbContext> options) : DbContext(options)
{

    public DbSet<User> Users { get; set; }
    public DbSet<Profile> Profiles { get; set; }
    public DbSet<ConnectionRequests>   ConnectionRequests { get; set; }
    public DbSet<Connections> Connections { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasOne(u => u.Profile)
            .WithOne(p => p.User)
            .HasForeignKey<Profile>(p => p.UserId);

        base.OnModelCreating(modelBuilder);
    }

}

   