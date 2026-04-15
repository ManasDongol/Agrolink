using System.Security.Claims;

using AgroLink.Application.DTOs.Ai;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly AgroLinkDbContext _db;
    private const int CONVERSATION_LIMIT = 10;

    public AiController(HttpClient httpClient, AgroLinkDbContext db)
    {
        _httpClient = httpClient;
        _db = db;
    }

    [HttpPost("ask")]
    public async Task<IActionResult> Ask([FromBody] AskRequestDto request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Get or create session
        AiSession session;
        if (request.SessionId.HasValue)
        {
            session = await _db.AiSessions
                .Include(s => s.AiMessages)
                .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.UserId == userId);
            if (session == null)
                return NotFound(new { error = "Session not found." });

            // 2 — Check conversation limit
            var userMessageCount = await _db.AiMessages
                .Where(m => m.AiSessionId == session.Id && m.Role == AiMessageRole.User)
                .CountAsync();

            if (userMessageCount >= CONVERSATION_LIMIT)
                return BadRequest(new
                {
                    error = "Conversation limit reached",
                    message = "This conversation has reached the 10 question limit. Please start a new chat."
                });
        }
        else
        {
            var title = request.Query.Length > 40
                ? request.Query[..40] + "..."
                : request.Query;

            session = new AiSession { UserId = userId, Title = title };
            _db.AiSessions.Add(session);
        }

        // 3 — Save user message
        _db.AiMessages.Add(new AiMessage
        {
            AiSessionId = session.Id,
            Role = AiMessageRole.User,
            Content = request.Query
        });

        // 4 — Call Python FastAPI
        Console.Write(request.Query);
        var pyResponse = await _httpClient.PostAsJsonAsync(
            "http://localhost:8000/ask", new { query = request.Query });

        if (!pyResponse.IsSuccessStatusCode)
            return StatusCode(502, new { error = "AI service unavailable." });

        var pyResult = await pyResponse.Content
            .ReadFromJsonAsync<Dictionary<string, string>>();
        var answer = pyResult!["answer"];

        // 5 — Save AI message
        _db.AiMessages.Add(new AiMessage
        {
            AiSessionId = session.Id,
            Role = AiMessageRole.Ai,
            Content = answer
        });

        session.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

    
        var totalUserMessages = await _db.AiMessages
            .Where(m => m.AiSessionId == session.Id && m.Role == AiMessageRole.User)
            .CountAsync();

        return Ok(new AiResponseDto
        {
            Answer = answer,
            SessionId = session.Id,
            SessionTitle = session.Title,
            QueriesUsed = totalUserMessages,
            QueriesRemaining = CONVERSATION_LIMIT - totalUserMessages,
            ConversationEnded = totalUserMessages >= CONVERSATION_LIMIT
        });
    }

    // ─── POST /api/Ai/ask/image ───────────────────────────────
    [HttpPost("ask/image")]
    public async Task<IActionResult> AskWithImage(
        [FromForm] string? query,
        [FromForm] Guid? sessionId,
        [FromForm] IFormFile image)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // 1 — Get or create session
        AiSession session;
        if (sessionId.HasValue)
        {
            session = await _db.AiSessions
                .Include(s => s.AiMessages)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);
            if (session == null)
                return NotFound(new { error = "Session not found." });

            var userMessageCount = await _db.AiMessages
                .Where(m => m.AiSessionId == session.Id && m.Role == AiMessageRole.User)
                .CountAsync();

            if (userMessageCount >= CONVERSATION_LIMIT)
                return BadRequest(new
                {
                    error = "Conversation limit reached",
                    message = "This conversation has reached the 10 question limit. Please start a new chat."
                });
        }
        else
        {
            var title = query?.Length > 40 ? query[..40] + "..." : query ?? "Image upload";
            session = new AiSession { UserId = userId, Title = title };
            _db.AiSessions.Add(session);
        }

        // 2 — Validate image
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(image.ContentType))
            return BadRequest(new { error = "Only JPG, PNG and WEBP allowed." });

        if (image.Length > 5 * 1024 * 1024)
            return BadRequest(new { error = "Image must be under 5MB." });

        // 3 — Save image to disk
        var folder = Path.Combine("wwwroot", "ai-uploads", userId.ToString());
        Directory.CreateDirectory(folder);
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
        var filePath = Path.Combine(folder, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
            await image.CopyToAsync(stream);

        var relativePath = $"/ai-uploads/{userId}/{fileName}";

        // 4 — Save user image message
        _db.AiMessages.Add(new AiMessage
        {
            AiSessionId = session.Id,
            Role = AiMessageRole.User,
            Content = query,
            IsImage = true,
            ImagePath = relativePath
        });

        // 5 — Forward to Python
        using var form = new MultipartFormDataContent();
        using var imageStream = image.OpenReadStream();
        form.Add(new StreamContent(imageStream), "image", image.FileName);
        if (!string.IsNullOrEmpty(query))
            form.Add(new StringContent(query), "query");

        var pyResponse = await _httpClient.PostAsync(
            "http://localhost:8000/ask-image", form);

        if (!pyResponse.IsSuccessStatusCode)
            return StatusCode(502, new { error = "AI service unavailable." });

        var pyResult = await pyResponse.Content
            .ReadFromJsonAsync<Dictionary<string, string>>();
        var answer = pyResult!["answer"];

        // 6 — Save AI message
        _db.AiMessages.Add(new AiMessage
        {
            AiSessionId = session.Id,
            Role = AiMessageRole.Ai,
            Content = answer
        });

        session.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        var totalUserMessages = await _db.AiMessages
            .Where(m => m.AiSessionId == session.Id && m.Role == AiMessageRole.User)
            .CountAsync();
        return Ok(new AiResponseDto
        {
            Answer = answer,
            SessionId = session.Id,
            SessionTitle = session.Title,
            QueriesUsed = totalUserMessages,
            QueriesRemaining = CONVERSATION_LIMIT - totalUserMessages,
            ConversationEnded = totalUserMessages >= CONVERSATION_LIMIT
        });
    }

    // ─── GET /api/Ai/sessions ─────────────────────────────────
    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var sessions = await _db.AiSessions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.UpdatedAt)
            .Select(s => new AiSessionDto
            {
                Id = s.Id,
                Title = s.Title,
                UpdatedAt = s.UpdatedAt
            })
            .ToListAsync();

        return Ok(sessions);
    }

    // ─── GET /api/Ai/sessions/{id} ────────────────────────────
    [HttpGet("sessions/{id}")]
    public async Task<IActionResult> GetSession(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var messages = await _db.AiMessages
            .Where(m => m.AiSession.Id == id && m.AiSession.UserId == userId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new AiMessageDto
            {
                Role = m.Role == AiMessageRole.User ? "user" : "ai",
                Content = m.Content,
                IsImage = m.IsImage,
                ImagePath = m.ImagePath,
                CreatedAt = m.CreatedAt
            })
            .ToListAsync();

        return Ok(messages);
    }

    // ─── DELETE /api/Ai/sessions/{id} ────────────────────────
    [HttpDelete("sessions/{id}")]
    public async Task<IActionResult> DeleteSession(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var session = await _db.AiSessions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (session == null) return NotFound();

        _db.AiSessions.Remove(session);
        await _db.SaveChangesAsync();

        return NoContent();
    }
    
    [HttpPost("disease/detect")]
    public async Task<IActionResult> DetectDisease([FromForm] IFormFile image)
    {
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(image.ContentType))
            return BadRequest(new { error = "Only JPG, PNG and WEBP allowed." });

        if (image.Length > 5 * 1024 * 1024)
            return BadRequest(new { error = "Image must be under 5MB." });

        using var form = new MultipartFormDataContent();
        using var stream = image.OpenReadStream();
        form.Add(new StreamContent(stream), "file", image.FileName);

        var pyResponse = await _httpClient.PostAsync("http://localhost:8000/disease/predict", form);
        if (!pyResponse.IsSuccessStatusCode)
            return StatusCode(502, new { error = "Disease detection service unavailable." });

        var result = await pyResponse.Content.ReadFromJsonAsync<object>();
        return Ok(result);
    }
}