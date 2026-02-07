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
    public class SavedProvidersController : ControllerBase
    {
        private readonly PetCareContext _context;

        public SavedProvidersController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SavedProvider>>> GetSavedProviders()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            return await _context.SavedProviders
                .Include(sp => sp.Provider)
                    .ThenInclude(p => p!.User)
                .Include(sp => sp.Provider)
                    .ThenInclude(p => p!.ProviderServices)
                        .ThenInclude(ps => ps.ServiceType)
                .Where(sp => sp.UserId == userId)
                .OrderByDescending(sp => sp.CreatedAt)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<SavedProvider>> SaveProvider([FromBody] SaveProviderDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            
            var existing = await _context.SavedProviders
                .FirstOrDefaultAsync(sp => sp.UserId == userId && sp.ProviderId == dto.ProviderId);

            if (existing != null)
            {
                return Ok(existing);
            }

            var savedProvider = new SavedProvider
            {
                UserId = userId,
                ProviderId = dto.ProviderId,
                CreatedAt = DateTime.UtcNow
            };

            _context.SavedProviders.Add(savedProvider);
            await _context.SaveChangesAsync();

            return Ok(savedProvider);
        }

        [HttpDelete("provider/{providerId}")]
        public async Task<IActionResult> UnsaveProvider(int providerId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var savedProvider = await _context.SavedProviders
                .FirstOrDefaultAsync(sp => sp.UserId == userId && sp.ProviderId == providerId);

            if (savedProvider == null)
            {
                return NotFound();
            }

            _context.SavedProviders.Remove(savedProvider);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("isSaved/{providerId}")]
        public async Task<ActionResult<bool>> IsProviderSaved(int providerId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            return await _context.SavedProviders
                .AnyAsync(sp => sp.UserId == userId && sp.ProviderId == providerId);
        }
    }

    public class SaveProviderDto
    {
        public int ProviderId { get; set; }
    }
}
