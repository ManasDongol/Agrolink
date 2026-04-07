using AgroLink.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace AgroLink.Application.Interfaces;

  public interface IDetectionHistoryService
    {
        Task<DetectionHistory> SaveDetectionAsync(
            Guid userId,
            IFormFile image,
            string predictedClass,
            string predictedClassRaw,
            float confidence
        );
 
        Task<IEnumerable<DetectionHistory>> GetHistoryAsync(Guid userId);
        
        Task<DetectionHistory?> GetByIdAsync(Guid id);
        Task<bool> DeleteDetectionAsync(Guid id, Guid userId);
    }
