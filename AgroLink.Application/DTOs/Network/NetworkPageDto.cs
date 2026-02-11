namespace AgroLink.Application.DTOs.Network;

public class NetworkPageDto
{
    public ProfileStatsDto MyProfile { get; set; }
    public List<NetworkUserDto> Users { get; set; }
    public List<ConnectionRequestDto> Requests { get; set; }
    public int TotalUsers { get; set; }
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
}
