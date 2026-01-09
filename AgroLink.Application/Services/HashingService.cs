using System.Security.Cryptography;
using System.Text;
using AgroLink.Application.DTOs;

namespace AgroLink.Application.Services;

public class HashingService
{
    public HashingResponseDto hash(string username,string password)
    {
        byte[] saltBytes=RandomNumberGenerator.GetBytes(16);
       string salt=Convert.ToBase64String(saltBytes);
        
        
       using var pbkdf2 = new Rfc2898DeriveBytes(
           password,
           saltBytes,
           100_000,
           HashAlgorithmName.SHA256
       );
       
        byte[] hashBytes = pbkdf2.GetBytes(32);
        string hash = Convert.ToBase64String(hashBytes);

        
        
        var responseDto = new HashingResponseDto(hash,salt);
        return  responseDto;
    }

    public bool ReHashPassword(string enteredPassword, string storedHash, string storedSalt)
    {
        byte[] saltBytes = Convert.FromBase64String(storedSalt);

        using var pbkdf2 = new Rfc2898DeriveBytes(
            enteredPassword,
            saltBytes,
            100_000,
            HashAlgorithmName.SHA256
        );

        byte[] computedHash = pbkdf2.GetBytes(32);
        byte[] storedHashBytes = Convert.FromBase64String(storedHash);

        return CryptographicOperations.FixedTimeEquals(
            computedHash,
            storedHashBytes
        );
    }
}