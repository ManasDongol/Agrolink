using AgroLink.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace AgroLink.Application.Interfaces;

// IAiService.cs
public interface IAiService
{
     Task<string> CallPythonAskAsync(string query, List<AiMessage> history);
    Task<string> CallPythonAskImageAsync(string? query, IFormFile image, List<AiMessage> history);
    Task<string> CallPythonDiseasePredictAsync(IFormFile image);
    Task<AiSession> GetOrCreateSessionAsync(Guid? sessionId, Guid userId, string? query);
}