using System.Security.Claims;

using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace AgroLink.Infrastructure.Repositories;

public class UserRepo(AgroLinkDbContext dbContext)
{
    // -----------------------------
    // Register User
    // -----------------------------
    
    public async Task<User?> RegisterUser(User user)
    {
        dbContext.Users.Add(user);

        try
        {
            var rowsInserted = await dbContext.SaveChangesAsync();
            return rowsInserted > 0 ? user : null;
        }
        catch (DbUpdateException ex)
        {
            if (ex.InnerException is PostgresException pg && pg.SqlState == "23505")
            {
                Console.WriteLine("Same username or email already exists.");
                return null;
            }

            throw; // rethrow unexpected DB errors
        }
    }

    // -----------------------------
    // Check if username exists
    // -----------------------------
    public async Task<User?> CheckUsernameExists(string username)
    {
        return await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Username == username);
    }

    // -----------------------------
    // Get user by email
    // -----------------------------
    public async Task<User?> GetUserByEmail(string email)
    {
        return await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Email == email);
    }

    // -----------------------------
    // Get user salt by username
    // -----------------------------
    public async Task<string?> GetUserSalt(string username)
    {
        return await dbContext.Users
            .AsNoTracking()
            .Where(x => x.Username == username)
            .Select(x => x.salt)
            .FirstOrDefaultAsync();
    }

    // -----------------------------
    // Get user by ID
    // -----------------------------
    public async Task<User?> GetUserByIdAsync(Guid userId)
    {
        return await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId);
    }

    public async Task<bool> CheckUserProfileExists(Guid userId)
    {
        
        
        
        var status = await dbContext.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
        Console.WriteLine("THE USER ID IS",userId);
        if (status != null)
        {
            return true;
        }

        return false;

    }
    // In UserRepo.cs
    public async Task<bool> MarkEmailVerifiedAsync(Guid userId)
    {
        var rows = await dbContext.Users
            .Where(u => u.UserId == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.IsEmailVerified, true));
        return rows > 0;
    }
}