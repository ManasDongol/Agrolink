using System.Security.Claims;
using AgroLink.Application.DTOs;
using AgroLink.Application.DTOs.Posts;
using AgroLink.Application.Services;
using AgroLink.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace AgroLink.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly CommentService _service;

        public CommentController(CommentService service)
        {
            _service = service;
        }

        // Add a top-level comment OR a reply — same endpoint, ParentCommentId distinguishes them
        [HttpPost]
        public async Task<ActionResult<CommentReturnDto>> AddComment([FromBody] CommentCreateDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out var userId))
                return Unauthorized();

            var comment = await _service.AddComment(dto.PostId, userId, dto.Content, dto.ParentCommentId);
            return Ok(comment);
        }

        // Get top-level comments for a post
        [HttpGet("{postId}")]
        public async Task<IActionResult> GetComments(Guid postId)
        {
            var comments = await _service.GetCommentsByPost(postId);
            return Ok(comments);
        }

        // ✅ Get replies for a specific comment
        [HttpGet("{commentId}/replies")]
        public async Task<IActionResult> GetReplies(Guid commentId)
        {
            var replies = await _service.GetRepliesByComment(commentId);
            return Ok(replies);
        }

        [HttpDelete("{commentId}")]
        public async Task<IActionResult> DeleteComment(Guid commentId)
        {
            await _service.DeleteComment(commentId);
            return NoContent();
        }
    }
}