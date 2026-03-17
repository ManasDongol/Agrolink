using AgroLink.Application.DTOs;
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
        var result = await _service.SendMessage((dto.SenderId).ToString(), (dto.ConversationId).ToString(), dto.Content);
        return Ok(result);
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
        // Call service to create conversation
        var conversation = await _service.CreateConversation(dto.User1Id, dto.User2Id);
    
        return Ok(conversation);
    }
}