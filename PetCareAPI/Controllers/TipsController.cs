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
    public class TipsController : ControllerBase
    {
        private readonly PetCareContext _context;

        public TipsController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Tip>>> GetTips([FromQuery] int? serviceTypeId = null)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            
            int userId = int.Parse(userIdClaim.Value);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            var query = _context.Tips.Where(t => t.IsActive);

            // Filter by user role (or global tips where UserRoleId is null)
            query = query.Where(t => t.UserRoleId == null || t.UserRoleId == user.RoleId);

            // If serviceTypeId provided, filter by it (or general tips where ServiceTypeId is null)
            if (serviceTypeId.HasValue)
            {
                query = query.Where(t => t.ServiceTypeId == null || t.ServiceTypeId == serviceTypeId.Value);
            }

            return await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
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
