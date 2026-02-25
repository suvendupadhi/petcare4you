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
        private readonly IWebHostEnvironment _environment;

        public ProvidersController(PetCareContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Provider>>> GetProviders(
            [FromQuery] string? serviceTypeIds = null,
            [FromQuery] string? city = null)
        {
            var query = _context.Providers
                .Include(p => p.ProviderServices)
                    .ThenInclude(ps => ps.ServiceType)
                .AsQueryable();

            if (!string.IsNullOrEmpty(serviceTypeIds))
            {
                var ids = serviceTypeIds.Split(',').Select(int.Parse).ToList();
                query = query.Where(p => p.ProviderServices.Any(ps => ids.Contains(ps.ServiceTypeId)));
            }

            if (!string.IsNullOrEmpty(city))
            {
                var searchCity = city.Replace(" ", "").ToLower();
                query = query.Where(p => p.City != null && p.City.Replace(" ", "").ToLower() == searchCity);
            }

            return await query.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Provider>> GetProvider(int id)
        {
            var provider = await _context.Providers
                .Include(p => p.User)
                .Include(p => p.ProviderServices)
                    .ThenInclude(ps => ps.ServiceType)
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

            if (providerDto.ServiceTypeIds != null && providerDto.ServiceTypeIds.Any())
            {
                foreach (var stId in providerDto.ServiceTypeIds.Distinct())
                {
                    provider.ProviderServices.Add(new ProviderService 
                    { 
                        ServiceTypeId = stId,
                        Price = provider.HourlyRate, // Use default hourly rate as initial price
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
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
                .Include(p => p.ProviderServices)
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

            // Update ProviderServices (syncing based on IDs provided in DTO)
            if (existing.ProviderServices == null) existing.ProviderServices = new List<ProviderService>();
            
            var currentServiceTypeIds = existing.ProviderServices
                .Where(ps => ps != null)
                .Select(ps => ps.ServiceTypeId)
                .ToList();
            
            // Remove those not in new list
            var toRemove = existing.ProviderServices
                .Where(ps => ps != null && !providerDto.ServiceTypeIds.Contains(ps.ServiceTypeId))
                .ToList();
            foreach (var ps in toRemove) existing.ProviderServices.Remove(ps);

            // Add new ones
            foreach (var stId in providerDto.ServiceTypeIds.Distinct())
            {
                if (!currentServiceTypeIds.Contains(stId))
                {
                    existing.ProviderServices.Add(new ProviderService 
                    { 
                        ServiceTypeId = stId,
                        Price = existing.HourlyRate,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("me/photo")]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateProviderPhoto(IFormFile file)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);

            if (provider == null)
                return NotFound("Provider profile not found");

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            try
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = $"provider_{provider.Id}_{DateTime.Now.Ticks}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                provider.ProfileImageUrl = $"/uploads/{fileName}";
                provider.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { url = provider.ProfileImageUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
