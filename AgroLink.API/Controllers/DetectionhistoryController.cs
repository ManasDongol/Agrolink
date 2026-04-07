using System.Security.Claims;
using AgroLink.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroLink.API.Controllers;


    [ApiController]
    [Route("api/[controller]")]
    [Authorize]  // all endpoints require JWT
    public class DetectionHistoryController : ControllerBase
    {
        private readonly IDetectionHistoryService _service;
 
        public DetectionHistoryController(IDetectionHistoryService service)
        {
            _service = service;
        }
 
        // GET api/detectionhistory
        [HttpGet]
        public async Task<IActionResult> GetHistory()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var history = await _service.GetHistoryAsync(userId);
            return Ok(history);
        }
 
        // GET api/detectionhistory/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var detection = await _service.GetByIdAsync(id);
            if (detection == null) return NotFound();
            return Ok(detection);
        }
 
        // POST api/detectionhistory/save
        [HttpPost("save")]
        public async Task<IActionResult> Save(
            [FromForm] IFormFile image,
            [FromForm] string predictedClass,
            [FromForm] string predictedClassRaw,
            [FromForm] float confidence)
        {
            if (image == null || image.Length == 0)
                return BadRequest("Image is required.");
 
            var userId =  Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
 
            var result = await _service.SaveDetectionAsync(
                userId, image, predictedClass, predictedClassRaw, confidence);
 
            return Ok(result);
        }
 
        // DELETE api/detectionhistory/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId =  Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var deleted = await _service.DeleteDetectionAsync(id, userId);
 
            if (!deleted) return NotFound();
            return Ok(new { message = "Detection deleted successfully." });
        }
    }
