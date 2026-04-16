using System.Security.Cryptography;
using System.Text;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.Infrastructure.Repositories.Auth;

public class AuthRepo(AgroLinkDbContext _context)
{

    public async Task<User?> GetUserByEmailAsync(string email)
        => await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

    public async Task InvalidateUserTokensAsync(Guid userId)
    {
        await _context.PasswordResetTokens
            .Where(t => t.UserId == userId && !t.IsUsed && t.ExpiresAt > DateTime.UtcNow)
            .ExecuteUpdateAsync(setters => setters.SetProperty(t => t.IsUsed, true));
    }

    public async Task AddResetTokenAsync(PasswordResetToken token)
    {
        _context.PasswordResetTokens.Add(token);
        await _context.SaveChangesAsync();
    }

    public async Task<PasswordResetToken?> getPasswordResetTokens(string tokenHash)
    {
        return await _context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t =>
                t.TokenHash == tokenHash &&
                !t.IsUsed &&
                t.ExpiresAt > DateTime.UtcNow);
    }
    
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }


    // 1. Invalidate any existing unused verification tokens for a user (before issuing a new one)
    public async Task InvalidateUserVerificationTokensAsync(Guid userId)
    {
        await _context.EmailVerificationTokens
            .Where(t => t.UserId == userId && !t.IsUsed && t.ExpiresAt > DateTime.UtcNow)
            .ExecuteUpdateAsync(setters => setters.SetProperty(t => t.IsUsed, true));
    }

// 2. Save a new verification token
    public async Task AddVerificationTokenAsync(EmailVerificationToken token)
    {
        _context.EmailVerificationTokens.Add(token);
        await _context.SaveChangesAsync();
    }

// 3. Look up a verification token by its hash (includes User so we can flip IsEmailVerified)
    public async Task<EmailVerificationToken?> GetVerificationTokenAsync(string tokenHash)
    {
        return await _context.EmailVerificationTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t =>
                t.TokenHash == tokenHash &&
                !t.IsUsed &&
                t.ExpiresAt > DateTime.UtcNow);
    }
}