using System.ComponentModel.DataAnnotations;

namespace AgroLink.Application.DTOs.Emails;

public class ResetPasswordDto
{
    [Required]
    public string Token { get; set; }

    [Required, MinLength(8)]
    public string NewPassword { get; set; }
}