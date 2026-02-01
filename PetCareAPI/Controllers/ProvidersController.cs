using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Data;
using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;
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
            [FromQuery] string? serviceTypeIds = null,
            [FromQuery] string? city = null)
        {
            var query = _context.Providers
                .Include(p => p.ServiceTypes)
                .AsQueryable();

            if (!string.IsNullOrEmpty(serviceTypeIds))
            {
                var ids = serviceTypeIds.Split(',').Select(int.Parse).ToList();
                query = query.Where(p => p.ServiceTypes.Any(st => ids.Contains(st.Id)));
            }

            if (!string.IsNullOrEmpty(city))
                query = query.Where(p => p.City == city);

            return await query.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Provider>> GetProvider(int id)
        {
            var provider = await _context.Providers
                .Include(p => p.User)
                .Include(p => p.ServiceTypes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (provider == null)
                return NotFound();

            return provider;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Provider>> CreateProvider([FromBody] ProviderUpdateDto providerDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var provider = new Provider
            {
                UserId = int.Parse(userIdClaim.Value),
                CompanyName = providerDto.CompanyName,
                Description = providerDto.Description,
                HourlyRate = providerDto.HourlyRate,
                Address = providerDto.Address,
                City = providerDto.City,
                Latitude = providerDto.Latitude,
                Longitude = providerDto.Longitude,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (providerDto.ServiceTypeIds.Any())
            {
                var serviceTypes = await _context.ServiceTypes
                    .Where(st => providerDto.ServiceTypeIds.Contains(st.Id))
                    .ToListAsync();
                provider.ServiceTypes = serviceTypes;
            }

            _context.Providers.Add(provider);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProvider), new { id = provider.Id }, provider);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProvider(int id, [FromBody] ProviderUpdateDto providerDto)
        {
            Console.WriteLine($"Updating provider {id}");
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var existing = await _context.Providers
                .Include(p => p.ServiceTypes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (existing == null)
                return NotFound();

            if (existing.UserId != int.Parse(userIdClaim.Value))
                return Forbid();

            existing.CompanyName = providerDto.CompanyName;
            existing.Description = providerDto.Description;
            existing.HourlyRate = providerDto.HourlyRate;
            existing.Address = providerDto.Address;
            existing.City = providerDto.City;
            existing.Latitude = providerDto.Latitude;
            existing.Longitude = providerDto.Longitude;
            existing.UpdatedAt = DateTime.UtcNow;

            // Update ServiceTypes
            existing.ServiceTypes.Clear();
            if (providerDto.ServiceTypeIds.Any())
            {
                var serviceTypes = await _context.ServiceTypes
                    .Where(st => providerDto.ServiceTypeIds.Contains(st.Id))
                    .ToListAsync();
                foreach (var st in serviceTypes)
                {
                    existing.ServiceTypes.Add(st);
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
