using AgroLink.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.Infrastructure.Data;

public class AgroLinkDbContext(DbContextOptions<AgroLinkDbContext> options) : DbContext(options)
{

    public DbSet<User> Users { get; set; }
    public DbSet<Profile> Profiles { get; set; }
}

   