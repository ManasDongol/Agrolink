using AgroLink.Application.Interfaces.Emails;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;          // for MimeMessage, TextPart, MailboxAddress
using Microsoft.Extensions.Configuration;


namespace AgroLink.Application.Services.EmailService;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
    {
        var settings = _config.GetSection("EmailSettings");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(settings["SenderName"], settings["SenderEmail"]));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = "Reset your AgroLink password";

        message.Body = new TextPart("html")
        {
            Text = $"""
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                            <h2 style="color: #2e7d32;">AgroLink Password Reset</h2>
                            <p>We received a request to reset your password.</p>
                            <p>Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.</p>
                            <a href="{resetLink}" 
                               style="display:inline-block; padding:12px 24px; background:#2e7d32; 
                                      color:white; text-decoration:none; border-radius:6px; margin:16px 0;">
                                Reset Password
                            </a>
                            <p style="color:#888; font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
                        </div>
                    """
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(settings["SmtpHost"], int.Parse(settings["SmtpPort"]!), SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(settings["SenderEmail"], settings["Password"]);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}