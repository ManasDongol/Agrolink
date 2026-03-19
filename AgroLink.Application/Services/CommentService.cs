using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;

namespace AgroLink.Application.Services;

public class CommentService
{
    private readonly AgroLinkDbContext _context;

    public CommentService(AgroLinkDbContext context)
    {
        _context = context;
    }

   
}