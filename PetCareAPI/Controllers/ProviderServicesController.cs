using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Data;
using PetCareAPI.Models;
using System.Security.Claims;

namespace PetCareAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProviderServicesController : ControllerBase
    {
        private readonly PetCareContext _context;

        public ProviderServicesController(PetCareContext context)
        {
            _context = context;
        }

        // GET: api/ProviderServices/MyServices
        [HttpGet("MyServices")]
        public async Task<ActionResult<IEnumerable<ProviderService>>> GetMyServices()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var provider = await _context.Providers
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (provider == null) return NotFound("Provider profile not found.");

            return await _context.ProviderServices
                .Include(ps => ps.ServiceType)
                .Where(ps => ps.ProviderId == provider.Id)
                .ToListAsync();
        }

        // POST: api/ProviderServices
        [HttpPost]
        public async Task<ActionResult<ProviderService>> CreateService(ProviderService service)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var provider = await _context.Providers
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (provider == null) return NotFound("Provider profile not found.");

            var exists = await _context.ProviderServices
                .AnyAsync(ps => ps.ProviderId == provider.Id && ps.ServiceTypeId == service.ServiceTypeId);

            if (exists) return BadRequest("You have already added this service type.");

            service.ProviderId = provider.Id;
            service.CreatedAt = DateTime.UtcNow;
            service.UpdatedAt = DateTime.UtcNow;

            _context.ProviderServices.Add(service);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMyServices), new { id = service.Id }, service);
        }

        // PUT: api/ProviderServices/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(int id, ProviderService service)
        {
            if (id != service.Id) return BadRequest();

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var provider = await _context.Providers
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (provider == null) return NotFound("Provider profile not found.");

            var existingService = await _context.ProviderServices
                .FirstOrDefaultAsync(ps => ps.Id == id && ps.ProviderId == provider.Id);

            if (existingService == null) return NotFound();

            existingService.Price = service.Price;
            existingService.Description = service.Description;
            
            if (existingService.ServiceTypeId != service.ServiceTypeId)
            {
                var conflict = await _context.ProviderServices
                    .AnyAsync(ps => ps.ProviderId == provider.Id && ps.ServiceTypeId == service.ServiceTypeId && ps.Id != id);
                if (conflict) return BadRequest("You already have another entry for this service type.");
                existingService.ServiceTypeId = service.ServiceTypeId;
            }
            
            existingService.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/ProviderServices/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var provider = await _context.Providers
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (provider == null) return NotFound("Provider profile not found.");

            var service = await _context.ProviderServices
                .FirstOrDefaultAsync(ps => ps.Id == id && ps.ProviderId == provider.Id);

            if (service == null) return NotFound();

            _context.ProviderServices.Remove(service);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
