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

        // Add a comment
        [HttpPost]
        public async Task<ActionResult<CommentReturnDto>> AddComment([FromBody] CommentCreateDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out var userId))
            {       
                return Unauthorized();
            }

            var newcomment=await _service.AddComment(dto.PostId, userId, dto.Content, dto.ParentCommentId);
            return Ok(newcomment);
        }

        // Get comments for a post
        [HttpGet("{postId}")]
        public async Task<IActionResult> GetComments(Guid postId)
        {
            var comments = await _service.GetCommentsByPost(postId); // we'll add this in service
            return Ok(comments);
        }

        // Delete a comment
        [HttpDelete("{commentId}")]
        public async Task<IActionResult> DeleteComment(Guid commentId)
        {
            await _service.DeleteComment(commentId); // we'll add this in service
            return NoContent();
        }
    }
}