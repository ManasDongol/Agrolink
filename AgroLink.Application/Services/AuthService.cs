using AgroLink.Application.DTOs;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Repositories;

namespace AgroLink.Application.Services;


public class AuthService(UserRepo userRepo, HashingService hashingService,TokenService tokenService):IAuthService
{
    
    //when a user logs in i must generate a new access token !
    
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
    public async Task<RegisterResponseDto> RegisterUser(RegisterRequestDto  registerDto)
    {
        var username=registerDto.Username;
        var email=registerDto.Email;
       
        var Hashresponse = hashingService.hash(registerDto.Username,registerDto.Password);

        var password = Hashresponse.hashedPassword;
       var storedSalt = Hashresponse.salt;
       
     
        var user = new User
        {
            Username = registerDto.Username,
            Email = registerDto.Email,
            Password = password,
            salt = storedSalt,
            UserType = registerDto.UserType
        };
        var result = await userRepo.RegisterUser(user);
        if (result != null)
        {
            return new RegisterResponseDto(registerDto,result.UserId,"User created successfully!");
        }

        return null;


    }
}