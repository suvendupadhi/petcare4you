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
    [Authorize]
    public class AvailabilityController : ControllerBase
    {
        private readonly PetCareContext _context;

        public AvailabilityController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet("provider/{providerId}")]
        public async Task<ActionResult<IEnumerable<Availability>>> GetProviderAvailability(int providerId)
        {
            return await _context.Availabilities
                .Where(a => a.ProviderId == providerId && a.Date >= DateTime.UtcNow.Date)
                .OrderBy(a => a.Date)
                .ThenBy(a => a.StartTime)
                .ToListAsync();
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<Availability>>> GetMyAvailability()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null) return NotFound("Provider profile not found");

            return await _context.Availabilities
                .Where(a => a.ProviderId == provider.Id && a.Date >= DateTime.UtcNow.Date)
                .OrderBy(a => a.Date)
                .ThenBy(a => a.StartTime)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Availability>> CreateAvailability([FromBody] Availability availability)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null) return NotFound("Provider profile not found");

            // Check for overlapping slots
            var overlap = await _context.Availabilities
                .AnyAsync(a => a.ProviderId == provider.Id && 
                               a.Date.Date == availability.Date.Date &&
                               ((availability.StartTime >= a.StartTime && availability.StartTime < a.EndTime) ||
                                (availability.EndTime > a.StartTime && availability.EndTime <= a.EndTime)));

            if (overlap) return BadRequest("This time slot overlaps with an existing one.");

            availability.ProviderId = provider.Id;
            availability.CreatedAt = DateTime.UtcNow;

            _context.Availabilities.Add(availability);
            await _context.SaveChangesAsync();

            return Ok(availability);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAvailability(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var availability = await _context.Availabilities
                .Include(a => a.Provider)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (availability == null) return NotFound();
            if (availability.Provider?.UserId != userId) return Forbid();

            _context.Availabilities.Remove(availability);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
