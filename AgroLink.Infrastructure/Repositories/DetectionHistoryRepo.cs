using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.Infrastructure.Repositories;
public class DetectionHistoryRepo
{
    private readonly AgroLinkDbContext _context;
 
    public DetectionHistoryRepo(AgroLinkDbContext context)
    {
        _context = context;
    }
 
    public async Task<DetectionHistory> AddAsync(DetectionHistory detection)
    {
        _context.DetectionHistories.Add(detection);
        await _context.SaveChangesAsync();
        return detection;
    }
 
    public async Task<IEnumerable<DetectionHistory>> GetByUserIdAsync(Guid userId)
    {
        return await _context.DetectionHistories
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.DetectedAt)
            .ToListAsync();
    }
 
    public async Task<DetectionHistory?> GetByIdAsync(Guid id)
    {
        return await _context.DetectionHistories.FindAsync(id);
    }
 
    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var detection = await _context.DetectionHistories
            .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);
 
        if (detection == null) return false;
 
        // Delete the image file from server
        if (File.Exists(detection.ImagePath))
            File.Delete(detection.ImagePath);
 
        _context.DetectionHistories.Remove(detection);
        await _context.SaveChangesAsync();
        return true;
    }
}