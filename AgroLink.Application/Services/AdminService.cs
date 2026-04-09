using AgroLink.Application.DTOs;
using AgroLink.Application.DTOs.Admin;
using AgroLink.Application.Interfaces;

using AgroLink.Infrastructure.Repositories;

namespace AgroLink.Application.Services;

public class AdminService : IAdminService
{
    private readonly AdminRepository _adminRepository;

    public AdminService(AdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<AdminStatsDto> GetStatsAsync()
    {
        return new AdminStatsDto
        {
            TotalUsers = await _adminRepository.GetTotalUsersAsync(),
            TotalAdmins = await _adminRepository.GetTotalAdminsAsync(),
            TotalPosts = await _adminRepository.GetTotalPostsAsync()
        };
    }

    public async Task<List<AdminUserDto>> GetAllUsersAsync()
    {
        var users = await _adminRepository.GetAllUsersAsync();

        return users.Select(u => new AdminUserDto
        {
            Id = u.UserId,
            Username = u.Username,
            Email = u.Email,
            UserType = u.UserType
        }).ToList();
    }

    public async Task<List<AdminUserDto>> GetAllAdminsAsync()
    {
        var admins = await _adminRepository.GetAllAdminsAsync();

        return admins.Select(u => new AdminUserDto
        {
            Id = u.UserId,
            Username = u.Username,
            Email = u.Email,
            UserType = u.UserType
        }).ToList();
    }

    public async Task<List<AdminPostDto>> GetAllPostsAsync()
    {
        var posts = await _adminRepository.GetAllPostsAsync();

        return posts.Select(p => new AdminPostDto
        {
            Id = p.PostId,
            Title = p.Title,
            Author = p.User != null ? p.User.Username : "Unknown",
            Created = p.Created,
            Category = p.PostCategory
        }).ToList();
    }

    public async Task<bool> VerifyProfileAsync(Guid userId)
    {
        return await _adminRepository.VerifyProfileAsync(userId);
    }

    public async Task<bool> RemoveUserAsync(Guid id)
    {
        var user = await _adminRepository.GetUserByIdAsync(id);
        if (user == null) return false;

        await _adminRepository.DeleteUserAsync(user);
        return true;
    }

    public async Task<bool> RemoveAdminAsync(Guid id)
    {
        var admin = await _adminRepository.GetUserByIdAsync(id);
        if (admin == null) return false;

        if (admin.UserType != "Admin" && admin.UserType != "SuperAdmin")
            return false;

        await _adminRepository.DeleteUserAsync(admin);
        return true;
    }
}