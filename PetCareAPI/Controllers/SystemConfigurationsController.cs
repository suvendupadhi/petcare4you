using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Data;
using PetCareAPI.Models;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SystemConfigurationsController : ControllerBase
    {
        private readonly PetCareContext _context;

        public SystemConfigurationsController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SystemConfiguration>>> GetConfigurations()
        {
            return await _context.SystemConfigurations.ToListAsync();
        }

        [HttpGet("{key}")]
        public async Task<ActionResult<SystemConfiguration>> GetConfiguration(string key)
        {
            var config = await _context.SystemConfigurations.FirstOrDefaultAsync(c => c.Key == key);
            if (config == null) return NotFound();
            return config;
        }

        [HttpPut("{key}")]
        public async Task<IActionResult> UpdateConfiguration(string key, [FromBody] UpdateConfigDto dto)
        {
            var config = await _context.SystemConfigurations.FirstOrDefaultAsync(c => c.Key == key);
            if (config == null) return NotFound();

            config.Value = dto.Value;
            config.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class UpdateConfigDto
    {
        public string Value { get; set; } = string.Empty;
    }
}
