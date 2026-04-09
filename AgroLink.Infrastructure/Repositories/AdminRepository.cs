namespace AgroLink.Infrastructure.Repositories;

using AgroLink.Domain.Entities;

using AgroLink.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;



public class AdminRepository
{
    private readonly AgroLinkDbContext _dbContext;

    public AdminRepository(AgroLinkDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<int> GetTotalUsersAsync()
    {
        return await _dbContext.Users.CountAsync();
    }

    public async Task<int> GetTotalAdminsAsync()
    {
        return await _dbContext.Users.CountAsync(u => u.UserType == "Admin" || u.UserType == "SuperAdmin");
    }

    public async Task<int> GetTotalPostsAsync()
    {
        return await _dbContext.Posts.CountAsync();
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await _dbContext.Users
            .AsNoTracking()
            .OrderBy(u => u.Username)
            .ToListAsync();
    }

    public async Task<List<User>> GetAllAdminsAsync()
    {
        return await _dbContext.Users
            .AsNoTracking()
            .Where(u => u.UserType == "Admin" || u.UserType == "SuperAdmin")
            .OrderBy(u => u.Username)
            .ToListAsync();
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(u => u.UserId == id);
    }

    public async Task DeleteUserAsync(User user)
    {
        _dbContext.Users.Remove(user);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<List<Domain.Entities.Posts>> GetAllPostsAsync()
    {
        return await _dbContext.Posts
            .Include(p => p.User)
            .AsNoTracking()
            .OrderByDescending(p => p.Created)
            .ToListAsync();
    }

    public async Task<bool> VerifyProfileAsync(Guid userId)
    {
        var profile = await _dbContext.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return false;

        profile.isVerified = true;
        await _dbContext.SaveChangesAsync();
        return true;
    }
}