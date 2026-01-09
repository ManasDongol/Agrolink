using AgroLink.Application.DTOs;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Repositories;

namespace AgroLink.Application.Services;

public class ProfileService(ProfileRepo profileRepo)
{
    public async Task<string> BuildProfile(ProfileRequestDto dto)
    {
        Profile newprofile =  new Profile();
        newprofile.FirstName =  dto.FirstName;
        newprofile.LastName = dto.LastName;
        newprofile.Address = dto.Address;
        newprofile.Role = dto.Role;
        newprofile.PhoneNumber = dto.PhoneNumber;
        newprofile.ProfilePicture = dto.ProfilePicture;
        newprofile.ProfileBackground = dto.ProfileBackgroundPicture;

        profileRepo.NewProfile(newprofile);

        return "true";

    }
}