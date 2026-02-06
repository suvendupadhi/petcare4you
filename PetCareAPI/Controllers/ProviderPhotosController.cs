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
    public class ProviderPhotosController : ControllerBase
    {
        private readonly PetCareContext _context;

        public ProviderPhotosController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet("provider/{providerId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ProviderPhoto>>> GetProviderPhotos(int providerId)
        {
            return await _context.ProviderPhotos
                .Where(p => p.ProviderId == providerId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<ProviderPhoto>>> GetMyPhotos()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null) return NotFound("Provider profile not found");

            return await _context.ProviderPhotos
                .Where(p => p.ProviderId == provider.Id)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<ProviderPhoto>> AddPhoto([FromBody] ProviderPhoto photo)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null) return NotFound("Provider profile not found");

            photo.ProviderId = provider.Id;
            photo.CreatedAt = DateTime.UtcNow;

            _context.ProviderPhotos.Add(photo);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProviderPhotos), new { providerId = provider.Id }, photo);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null) return NotFound("Provider profile not found");

            var photo = await _context.ProviderPhotos
                .FirstOrDefaultAsync(p => p.Id == id && p.ProviderId == provider.Id);

            if (photo == null) return NotFound();

            _context.ProviderPhotos.Remove(photo);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
