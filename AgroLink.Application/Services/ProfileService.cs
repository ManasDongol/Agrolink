using AgroLink.Application.DTOs;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Repositories;

namespace AgroLink.Application.Services;

public class ProfileService(ProfileRepo profileRepo)
{
    public async Task<ProfileResponseDto> BuildProfile(
    ProfileRequestDto dto,
    string? profileImagePath,
    string? backgroundImagePath)
{
    var existingProfile = await profileRepo.GetProfileByUserId(Guid.Parse(dto.UserID));

    Profile profile;

    if (existingProfile != null)
    {
        //old profile is updated here
        existingProfile.FirstName = dto.FirstName;
        existingProfile.LastName = dto.LastName;
        existingProfile.Address = dto.Address;
        existingProfile.Role = dto.Role;
        existingProfile.PhoneNumber = dto.PhoneNumber ?? string.Empty;
        existingProfile.Description = dto.Description ?? string.Empty;
        existingProfile.Achievement = dto.Achievement ?? string.Empty;

        // Only update images if new ones uploaded
        if (!string.IsNullOrEmpty(profileImagePath))
            existingProfile.ProfilePicture = profileImagePath;

        if (!string.IsNullOrEmpty(backgroundImagePath))
            existingProfile.ProfileBackground = backgroundImagePath;

        profile = await profileRepo.UpdateProfile(existingProfile) ?? existingProfile;
    }
    else
    {
        //new  profile is created from here
        profile = new Profile
        {
            UserId = Guid.Parse(dto.UserID),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Address = dto.Address ?? string.Empty,
            Role = dto.Role,
            PhoneNumber = dto.PhoneNumber ?? string.Empty,
            Description = dto.Description ?? string.Empty,
            Achievement = dto.Achievement ?? string.Empty,
            ProfilePicture = profileImagePath ?? string.Empty,
            ProfileBackground = backgroundImagePath ?? string.Empty
        };

        var result = await profileRepo.NewProfile(profile);
        if (result == null)
            throw new Exception("Failed to create profile");

        profile = result;
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