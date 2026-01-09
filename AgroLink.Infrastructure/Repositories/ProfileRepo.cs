using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;

namespace AgroLink.Infrastructure.Repositories;

public class ProfileRepo(AgroLinkDbContext dbContext)
{
    public async Task<Profile?> NewProfile(Profile profile)
    {
        var result = dbContext.Profiles.AddAsync(profile);
        var rowsInserted = await dbContext.SaveChangesAsync();
        if (rowsInserted > 0)
        {
            return profile;
        }

        return profile;
    }
}