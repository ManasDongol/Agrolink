using System.Security.Claims;
using AgroLink.Application.DTOs;
using AgroLink.Application.DTOs.Messages;
using AgroLink.Application.Services;
using AgroLink.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace AgroLink.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessageController(MessageService _service): ControllerBase
{
    [HttpGet("conversations/{userId}")]
    public async Task<IActionResult> GetConversations(Guid userId)
    {
        var result = await _service.GetUserConversations(userId);
        return Ok(result);
    }

    
    [HttpGet("messages/{conversationId}")]
    public async Task<IActionResult> GetMessages(Guid conversationId)
    {
        var result = await _service.GetMessages(conversationId);
        return Ok(result);
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
    {
        try
        {
            var result = await _service.SendMessage((dto.SenderId).ToString(), (dto.ConversationId).ToString(), dto.Content);
            return Ok(new {
                messageId = result.MessageId,
                senderId = result.SenderId,
                conversationId = result.ConversationId,
                content = result.Content,
                sent = result.Sent
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
       
    }
    
    [HttpGet("connections/{userId}")]
    public async Task<IActionResult> GetConnections(string userId)
    {
        var result = await _service.GetConnections(Guid.Parse(userId));
        return Ok(result);
    }
    
    [HttpPost("conversations")]
    public async Task<IActionResult> CreateConversation([FromBody] ConversationDto dto)
    {
        var currentuserid = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        // Call service to create conversation
        var conversation = await _service.CreateConversation(currentuserid,dto.User1Id, dto.User2Id);
    
        return Ok(conversation);
    }

    [HttpPost("sendImage")]
    public async Task<IActionResult> SendImage([FromForm] SendImageDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            return Unauthorized();

        if (dto.File == null || dto.File.Length == 0)
            return BadRequest("No file provided.");

        var imageUrl = await _service.UploadImage(dto.File, userId, dto.ConversationId.ToString());

        return Ok(new { imageUrl });
    }
}