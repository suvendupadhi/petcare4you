using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetCareAPI.Data;
using PetCareAPI.Models;
using System.Security.Claims;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FeedbacksController : ControllerBase
    {
        private readonly PetCare4YouContext _context;

        public FeedbacksController(PetCare4YouContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateFeedback([FromBody] FeedbackCreateDto feedbackDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var feedback = new Feedback
            {
                UserId = userId,
                Subject = feedbackDto.Subject,
                Message = feedbackDto.Message,
                CreatedAt = DateTime.UtcNow
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Feedback submitted successfully" });
        }
    }

    public class FeedbackCreateDto
    {
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
