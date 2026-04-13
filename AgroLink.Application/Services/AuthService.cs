using System.Security.Cryptography;
using System.Text;
using AgroLink.Application.DTOs;
using AgroLink.Application.DTOs.Emails;
using AgroLink.Application.Interfaces.Emails;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Repositories;
using AgroLink.Infrastructure.Repositories.Auth;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.Application.Services;


public class AuthService(UserRepo userRepo, HashingService hashingService,TokenService tokenService,AuthRepo authRepo, IEmailService _emailService):IAuthService
{
    
   public async Task<LoginResponseDto?> LoginUser(LoginRequestDto loginDto)
   {
       var username = loginDto.username;
   
       var user = await userRepo.CheckUsernameExists(username);
   
       if (user == null)
       {
           return new LoginResponseDto(null, null, "Username doesn't exist");
       }
   
       var isPasswordValid = hashingService.ReHashPassword(
           loginDto.password,
           user.Password,
           user.salt
       );
   
       if (!isPasswordValid)
       {
           return new LoginResponseDto(null, null, "Invalid password");
       }
   
       var token = tokenService.createToken(user);
   
       Console.WriteLine($"Token created: {token}");
   
       return new LoginResponseDto(loginDto, token, "Login successful");
   }
    
    
    // no tokens generated during registration i nneed to redirect to login
    public async Task<RegisterResponseDto?> RegisterUser(RegisterRequestDto registerDto)
    {
        try
        {
            var hashResponse = hashingService.hash(registerDto.Username, registerDto.Password);

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Password = hashResponse.hashedPassword,
                salt = hashResponse.salt,
                UserType = registerDto.UserType
            };

            var result = await userRepo.RegisterUser(user);

            return new RegisterResponseDto(registerDto, result.UserId, "User created successfully");
        }
        catch (DbUpdateException ex)
        {
            // uniqueness violation
            if (ex.InnerException?.Message.Contains("UNIQUE") == true)
                return null;

            throw;
        }
    }

    
        public async Task ForgotPasswordAsync(string email)
        {
            var user = await authRepo.GetUserByEmailAsync(email);
            if (user == null) return; // silently do nothing

            await authRepo.InvalidateUserTokensAsync(user.UserId);

            var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            var tokenHash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

            await authRepo.AddResetTokenAsync(new PasswordResetToken
            {
                UserId = user.UserId,
                TokenHash = tokenHash,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15)
            });

            var safeToken = Uri.EscapeDataString(rawToken);
            var resetLink = $"http://localhost:4200/reset-password?token={safeToken}";

            await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink);
        }

        public async Task<bool> ResetPassword(ResetPasswordDto dto)
        {
            var tokenHash = Convert.ToBase64String(
                SHA256.HashData(Encoding.UTF8.GetBytes(dto.Token))
            );

            var resetToken = await authRepo.getPasswordResetTokens(tokenHash);

            if (resetToken == null) return false; //  signals failure

            var hashResponse = hashingService.hash(resetToken.User.Username, dto.NewPassword);

            resetToken.User.Password = hashResponse.hashedPassword;
            resetToken.User.salt = hashResponse.salt;
            resetToken.IsUsed = true;

            await authRepo.SaveChangesAsync();

            return true; //  signals success
        }

        public async Task<bool> CheckProfileExists(Guid userid)
        {

            return await userRepo.CheckUserProfileExists(userid);
        }
    
}