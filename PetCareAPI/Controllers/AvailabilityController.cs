using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Data;
using PetCareAPI.Models;
using System.Security.Claims;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

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
                .Where(a => a.ProviderId == providerId)
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
                .Where(a => a.ProviderId == provider.Id)
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

            //var query = _context.Availabilities
            //   .Where(a => a.ProviderId == provider.Id &&
            //                  ((availability.StartTime >= a.StartTime && availability.StartTime < a.EndTime) ||
            //                   (availability.EndTime > a.StartTime && availability.EndTime <= a.EndTime)));
            //var sql = query.ToQueryString();

            // Check for overlapping slots
            var overlap = await _context.Availabilities
                .AnyAsync(a => a.ProviderId == provider.Id &&
                               availability.StartTime < a.EndTime &&
                               availability.EndTime > a.StartTime);

            //var overlap = await _context.Availabilities
            //.AnyAsync(a =>
            //    a.ProviderId == provider.Id &&
            //    availability.StartTime < a.EndTime &&
            //    availability.EndTime > a.StartTime
            //);


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
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null) return NotFound("Provider profile not found");

            var availability = await _context.Availabilities
                .FirstOrDefaultAsync(a => a.Id == id && a.ProviderId == provider.Id);

            if (availability == null) return NotFound();
            if (availability.IsBooked) return BadRequest("Cannot delete a booked slot");

            _context.Availabilities.Remove(availability);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
