using System.Security.Claims;
using AgroLink.Application.DTOs;
using AgroLink.Application.DTOs.Posts;
using AgroLink.Application.Services;
using AgroLink.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroLink.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly CommentService _service;

        public CommentController(CommentService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult<CommentReturnDto>> AddComment([FromBody] CommentCreateDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!Guid.TryParse(userIdString, out var userId))
                return Unauthorized();

            try
            {
                var comment = await _service.AddComment(dto.PostId, userId, dto.Content, dto.ParentCommentId);
                return Ok(comment);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Post not found or deleted" });
            }
        }

        [HttpGet("{postId}")]
        public async Task<IActionResult> GetComments(Guid postId)
        {
            var comments = await _service.GetCommentsByPost(postId);
            return Ok(comments);
        }

        [HttpGet("{commentId}/replies")]
        public async Task<IActionResult> GetReplies(Guid commentId)
        {
            var replies = await _service.GetRepliesByComment(commentId);
            return Ok(replies);
        }

        [HttpDelete("{commentId}")]
        public async Task<IActionResult> DeleteComment(Guid commentId)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!Guid.TryParse(userIdString, out var userId))
                return Unauthorized();

            try
            {
                await _service.DeleteComment(commentId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Comment not found" });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }
    }
}