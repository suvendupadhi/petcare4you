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
    public class TipsController : ControllerBase
    {
        private readonly PetCareContext _context;

        public TipsController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Tip>>> GetTips([FromQuery] int? serviceTypeId = null, [FromQuery] bool includeInactive = false)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            
            int userId = int.Parse(userIdClaim.Value);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            var query = _context.Tips.AsQueryable();
            
            if (!includeInactive)
            {
                query = query.Where(t => t.IsActive);
            }

            // Filter by user role (or global tips where UserRoleId is null)
            // Unless it's an admin-like management request where we might want all
            // For now, keep the role filter
            query = query.Where(t => t.UserRoleId == null || t.UserRoleId == user.RoleId);

            // If serviceTypeId provided, filter by it (or general tips where ServiceTypeId is null)
            if (serviceTypeId.HasValue)
            {
                query = query.Where(t => t.ServiceTypeId == null || t.ServiceTypeId == serviceTypeId.Value);
            }

            return await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Tip>> GetTip(int id)
        {
            var tip = await _context.Tips.FindAsync(id);
            if (tip == null) return NotFound();
            return tip;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Tip>> CreateTip([FromBody] TipCreateDto tipDto)
        {
            var tip = new Tip
            {
                Title = tipDto.Title,
                Content = tipDto.Content,
                UserRoleId = tipDto.UserRoleId,
                ServiceTypeId = tipDto.ServiceTypeId,
                IsActive = tipDto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tips.Add(tip);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTip), new { id = tip.Id }, tip);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateTip(int id, [FromBody] TipUpdateDto tipDto)
        {
            var tip = await _context.Tips.FindAsync(id);
            if (tip == null) return NotFound();

            tip.Title = tipDto.Title;
            tip.Content = tipDto.Content;
            tip.UserRoleId = tipDto.UserRoleId;
            tip.ServiceTypeId = tipDto.ServiceTypeId;
            tip.IsActive = tipDto.IsActive;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteTip(int id)
        {
            var tip = await _context.Tips.FindAsync(id);
            if (tip == null) return NotFound();

            _context.Tips.Remove(tip);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("random")]
        [Authorize]
        public async Task<ActionResult<Tip>> GetRandomTip([FromQuery] int? serviceTypeId = null)
        {
            var tips = await GetTips(serviceTypeId);
            var tipsList = tips.Value?.ToList();
            
            if (tipsList == null || !tipsList.Any())
                return NotFound("No tips found");

            var random = new Random();
            return tipsList[random.Next(tipsList.Count)];
        }
    }
}
