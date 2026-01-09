using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AgroLink.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AgroLink.Application.Services;

public class TokenService(IConfiguration configuration)
{
    public string createToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.NameIdentifier,user.UserId.ToString()),
           

        };
        
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(configuration.GetValue<string>("token:Key")!)
        );
        
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var TokenDescriptor = new JwtSecurityToken(
            issuer:configuration.GetValue<string>("token:Issuer"),
            audience:configuration.GetValue<string>("token:Audience"),
            claims: claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials:creds
        );
        
        return new JwtSecurityTokenHandler().WriteToken(TokenDescriptor);
    }

}