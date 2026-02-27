using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Data;
using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;
using PetCareAPI.Constants;
using System.Security.Claims;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TipsController : ControllerBase
    {
        private readonly PetCare4YouContext _context;

        public TipsController(PetCare4YouContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Tip>>> GetTips([FromQuery] int? serviceTypeId = null, [FromQuery] bool includeInactive = false)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            // Check if tips are hidden globally
            var hideTipsConfig = await _context.SystemConfigurations
                .FirstOrDefaultAsync(c => c.Key == "hide_tips_management");
            
            if (hideTipsConfig?.Value?.ToLower() == "true")
            {
                // If user is superadmin, they can still see it for management
                var userCheck = await _context.Users.FindAsync(int.Parse(userIdClaim.Value));
                if (userCheck?.RoleId != 4) // Assuming 4 is superadmin
                {
                    return Ok(new List<Tip>()); // Return empty list
                }
            }
            
            int userId = int.Parse(userIdClaim.Value);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            var query = _context.Tips.AsQueryable();
            
            if (!includeInactive)
            {
                query = query.Where(t => t.RowStatus == StatusConstants.RowStatus.Active);
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
                RowStatus = tipDto.IsActive ? StatusConstants.RowStatus.Active : StatusConstants.RowStatus.Inactive,
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
            tip.RowStatus = tipDto.IsActive ? StatusConstants.RowStatus.Active : StatusConstants.RowStatus.Inactive;

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
            var tipsResult = await GetTips(serviceTypeId);
            var tipsList = (tipsResult.Result as OkObjectResult)?.Value as List<Tip>;
            
            if (tipsList == null || !tipsList.Any())
                return NotFound("No tips found");

            var random = new Random();
            return Ok(tipsList[random.Next(tipsList.Count)]);
        }
    }
}
