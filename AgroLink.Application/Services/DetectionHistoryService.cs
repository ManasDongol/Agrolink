using AgroLink.Application.Interfaces;
using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Repositories;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace AgroLink.Application.Services;


public class DetectionHistoryService : IDetectionHistoryService
{
    private readonly DetectionHistoryRepo _repo;
    private readonly IWebHostEnvironment _env;

    public DetectionHistoryService(
        DetectionHistoryRepo repo,
        IWebHostEnvironment env)
    {
        _repo = repo;
        _env = env;
    }

    public async Task<DetectionHistory> SaveDetectionAsync(
        Guid userId,
        IFormFile image,
        string predictedClass,
        string predictedClassRaw,
        float confidence)
    {
        // Save image to wwwroot/uploads/detections/
        var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "detections");
        Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        var detection = new DetectionHistory
        {
            UserId = userId,
            ImageFileName = uniqueFileName,
            ImagePath = filePath,
            PredictedClass = predictedClass,
            PredictedClassRaw = predictedClassRaw,
            Confidence = confidence,
            DetectedAt = DateTime.UtcNow
        };

        return await _repo.AddAsync(detection);
    }

    public async Task<IEnumerable<DetectionHistory>> GetHistoryAsync(Guid userId)
    {
        return await _repo.GetByUserIdAsync(userId);
    }

    public async Task<DetectionHistory?> GetByIdAsync(Guid id)
    {
        return await _repo.GetByIdAsync(id);
    }

    public async Task<bool> DeleteDetectionAsync(Guid id, Guid userId)
    {
        return await _repo.DeleteAsync(id, userId);
    }
}