using System.ComponentModel.DataAnnotations;

namespace AgroLink.Application.DTOs.Emails;

public class ForgotPasswordDto
{
    [Required, EmailAddress]
    public string Email { get; set; }
}