using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Data;
using PetCareAPI.Models;
using System.Security.Claims;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly PetCareContext _context;

        public ReviewsController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet("provider/{providerId}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetProviderReviews(int providerId)
        {
            return await _context.Reviews
                .Include(r => r.Owner)
                .Where(r => r.ProviderId == providerId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Review>> CreateReview([FromBody] Review review)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            
            int userId = int.Parse(userIdClaim.Value);
            review.OwnerId = userId;
            review.CreatedAt = DateTime.UtcNow;

            // Verify appointment belongs to user and is completed
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == review.AppointmentId && a.OwnerId == userId);

            if (appointment == null)
                return BadRequest("Invalid appointment.");

            if (appointment.Status != 3) // Assuming 3 is Completed
                 return BadRequest("Can only rate completed appointments.");

            // Check if already reviewed
            var existingReview = await _context.Reviews
                .AnyAsync(r => r.AppointmentId == review.AppointmentId);
            
            if (existingReview)
                return BadRequest("Appointment already reviewed.");

            _context.Reviews.Add(review);

            // Update Provider Average Rating
            var provider = await _context.Providers.FindAsync(review.ProviderId);
            if (provider != null)
            {
                var providerReviews = await _context.Reviews
                    .Where(r => r.ProviderId == review.ProviderId)
                    .Select(r => r.Rating)
                    .ToListAsync();
                
                providerReviews.Add(review.Rating);
                
                provider.Rating = (decimal)providerReviews.Average();
                provider.ReviewCount = providerReviews.Count;
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProviderReviews), new { providerId = review.ProviderId }, review);
        }
    }
}
