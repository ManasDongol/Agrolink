using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.Infrastructure.Repositories;

public class ProfileRepo(AgroLinkDbContext dbContext)
{
    public async Task<Profile?> NewProfile(Profile profile)
    {
        // Generate ProfileId if not already set
        if (profile.ProfileId == Guid.Empty)
        {
            profile.ProfileId = Guid.NewGuid();
        }
        
        await dbContext.Profiles.AddAsync(profile);
        var rowsInserted = await dbContext.SaveChangesAsync();
        
        if (rowsInserted > 0)
        {
            return profile;
        }

        return null;
    }

    public async Task<Profile?> GetProfileByUserId(Guid userId)
    {
        return await dbContext.Profiles
            .FirstOrDefaultAsync(p => p.UserId == userId);
    }

    public async Task<Profile?> UpdateProfile(Profile profile)
    {
        dbContext.Profiles.Update(profile);
        var rowsUpdated = await dbContext.SaveChangesAsync();
        
        if (rowsUpdated > 0)
        {
            return profile;
        }

        return null;
    }
}