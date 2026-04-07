using System.Security.Claims;
using AgroLink.API.Hubs;
using AgroLink.Application.Interfaces;
using AgroLink.Application.Services;
using AgroLink.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace AgroLink.API.Controllers;


    [Authorize]
    [ApiController]
    [Route("api/notification")]
    public class NotificationsController(INotificationService _service) : ControllerBase
    {
        private Guid UserId =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetNotifications() =>
            Ok(await _service.GetNotificationsAsync(UserId));

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount() =>
            Ok(new { count = await _service.GetUnreadCountAsync(UserId) });

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkRead(Guid id)
        {
            await _service.MarkReadAsync(id, UserId);
            return Ok();
        }

        [HttpPost("mark-all-read")]
        public async Task<IActionResult> MarkAllRead()
        {
            await _service.MarkAllReadAsync(UserId);
            return Ok();
        }
    }
