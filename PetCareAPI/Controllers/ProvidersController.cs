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
    public class ProvidersController : ControllerBase
    {
        private readonly PetCareContext _context;

        public ProvidersController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Provider>>> GetProviders(
            [FromQuery] string? serviceType = null,
            [FromQuery] string? city = null)
        {
            var query = _context.Providers.AsQueryable();

            if (!string.IsNullOrEmpty(serviceType))
                query = query.Where(p => p.ServiceType == serviceType);

            if (!string.IsNullOrEmpty(city))
                query = query.Where(p => p.City == city);

            return await query.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Provider>> GetProvider(int id)
        {
            var provider = await _context.Providers
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (provider == null)
                return NotFound();

            return provider;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Provider>> CreateProvider([FromBody] Provider provider)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            provider.UserId = int.Parse(userIdClaim.Value);
            provider.CreatedAt = DateTime.UtcNow;
            provider.UpdatedAt = DateTime.UtcNow;

            _context.Providers.Add(provider);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProvider), new { id = provider.Id }, provider);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProvider(int id, [FromBody] Provider provider)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var existing = await _context.Providers.FindAsync(id);
            if (existing == null)
                return NotFound();

            if (existing.UserId != int.Parse(userIdClaim.Value))
                return Forbid();

            existing.CompanyName = provider.CompanyName;
            existing.Description = provider.Description;
            existing.ServiceType = provider.ServiceType;
            existing.HourlyRate = provider.HourlyRate;
            existing.Address = provider.Address;
            existing.City = provider.City;
            existing.Latitude = provider.Latitude;
            existing.Longitude = provider.Longitude;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
