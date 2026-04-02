using System.Security.Cryptography;
using System.Text;
using AgroLink.Application.DTOs.Emails;
using AgroLink.Application.Interfaces.Emails;
using AgroLink.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Crypto.Generators;

namespace AgroLink.API.Controllers;

public class EmailController(IEmailService emailService, IConfiguration configuration): ControllerBase
{
    // In AuthController.cs

}