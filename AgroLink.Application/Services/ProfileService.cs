using AgroLink.Application.DTOs;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Repositories;

namespace AgroLink.Application.Services;

public class ProfileService(ProfileRepo profileRepo)
{
    public async Task<ProfileResponseDto> BuildProfile(ProfileRequestDto dto)
    {
        // Check if profile already exists
        var existingProfile = await profileRepo.GetProfileByUserId(dto.UserID);
        
        Profile profile;
        if (existingProfile != null)
        {
            // Update existing profile
            existingProfile.FirstName = dto.FirstName;
            existingProfile.LastName = dto.LastName;
            existingProfile.Address = dto.Address ?? string.Empty;
            existingProfile.Role = dto.Role;
            existingProfile.PhoneNumber = dto.PhoneNumber ?? string.Empty;
            existingProfile.ProfilePicture = dto.ProfilePicture ?? string.Empty;
            existingProfile.ProfileBackground = dto.ProfileBackgroundPicture ?? string.Empty;
            existingProfile.Description = dto.Description ?? string.Empty;
            existingProfile.Achievement = dto.Achievement ?? string.Empty;
            
            profile = await profileRepo.UpdateProfile(existingProfile) ?? existingProfile;
        }
        else
        {
            // Create new profile
            profile = new Profile();
            profile.UserId = dto.UserID;
            profile.FirstName = dto.FirstName;
            profile.LastName = dto.LastName;
            profile.Address = dto.Address ?? string.Empty;
            profile.Role = dto.Role;
            profile.PhoneNumber = dto.PhoneNumber ?? string.Empty;
            profile.ProfilePicture = dto.ProfilePicture ?? string.Empty;
            profile.ProfileBackground = dto.ProfileBackgroundPicture ?? string.Empty;
            profile.Description = dto.Description ?? string.Empty;
            profile.Achievement = dto.Achievement ?? string.Empty;

            var result = await profileRepo.NewProfile(profile);
            if (result == null)
            {
                throw new Exception("Failed to create profile");
            }
            profile = result;
        }

        ProfileResponseDto response = new ProfileResponseDto(
            profile.ProfileId,
            profile.UserId,
            profile.FirstName,
            profile.LastName,
            profile.Role,
            profile.Address,
            profile.PhoneNumber,
            profile.ProfilePicture,
            profile.ProfileBackground,
            profile.Description,
            profile.Achievement
        );
        
        return response;
    }

    public async Task<ProfileResponseDto?> GetProfileByUserId(Guid userId)
    {
        var profile = await profileRepo.GetProfileByUserId(userId);
        
        if (profile == null)
        {
            return null;
        }

        return new ProfileResponseDto(
            profile.ProfileId,
            profile.UserId,
            profile.FirstName,
            profile.LastName,
            profile.Role,
            profile.Address,
            profile.PhoneNumber,
            profile.ProfilePicture,
            profile.ProfileBackground,
            profile.Description,
            profile.Achievement
        );
    }
}