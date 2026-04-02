namespace AgroLink.Application.Interfaces.Emails;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink);
}