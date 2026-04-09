using System.Net.Http.Json;
using AgroLink.Application.Interfaces;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Repositories;
using Microsoft.AspNetCore.Http;

namespace AgroLink.Application.Services;

// AiService.cs
public class AiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly AiRepository _repo;
    private const int CONVERSATION_LIMIT = 10;
    private const string PythonBaseUrl = "http://localhost:8000";

    public AiService(HttpClient httpClient, AiRepository repo)
    {
        _httpClient = httpClient;
        _repo = repo;
    }

    public async Task<AiSession> GetOrCreateSessionAsync(Guid? sessionId, Guid userId, string? query)
    {
        if (sessionId.HasValue)
        {
            var existing = await _repo.GetSessionAsync(sessionId.Value, userId);
            if (existing == null)
                throw new KeyNotFoundException("Session not found.");

            var userMessageCount = existing.AiMessages.Count(m => m.Role == AiMessageRole.User);
            if (userMessageCount >= CONVERSATION_LIMIT)
                throw new InvalidOperationException("Conversation limit reached.");

            return existing;
        }

        var title = query?.Length > 40 ? query[..40] + "..." : query ?? "Image upload";
        return await _repo.CreateSessionAsync(userId, title);
    }

    // Builds the history payload and sends it to Python
    public async Task<string> CallPythonAskAsync(string query, List<AiMessage> history)
    {
        var historyPayload = history.Select(m => new
        {
            role = m.Role == AiMessageRole.User ? "user" : "assistant",
            content = m.Content ?? ""
        }).ToList();

        var payload = new { query, history = historyPayload };

        var response = await _httpClient.PostAsJsonAsync($"{PythonBaseUrl}/ask", payload);
        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException("AI service unavailable.");

        var result = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
        return result!["answer"];
    }

    public async Task<string> CallPythonAskImageAsync(string? query, IFormFile image, List<AiMessage> history)
    {
        using var form = new MultipartFormDataContent();
        using var imageStream = image.OpenReadStream();
        form.Add(new StreamContent(imageStream), "image", image.FileName);

        if (!string.IsNullOrEmpty(query))
            form.Add(new StringContent(query), "query");

        // Pass last text-only messages as context
        var historyJson = System.Text.Json.JsonSerializer.Serialize(
            history.Where(m => !m.IsImage).Select(m => new
            {
                role = m.Role == AiMessageRole.User ? "user" : "assistant",
                content = m.Content ?? ""
            })
        );
        form.Add(new StringContent(historyJson), "history");

        var response = await _httpClient.PostAsync($"{PythonBaseUrl}/ask-image", form);
        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException("AI service unavailable.");

        var result = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
        return result!["answer"];
    }

    public async Task<string> CallPythonDiseasePredictAsync(IFormFile image)
    {
        using var form = new MultipartFormDataContent();
        using var stream = image.OpenReadStream();
        form.Add(new StreamContent(stream), "file", image.FileName);

        var response = await _httpClient.PostAsync($"{PythonBaseUrl}/disease/predict", form);
        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException("Disease detection service unavailable.");

        return await response.Content.ReadAsStringAsync();
    }
}