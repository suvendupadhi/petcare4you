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
    public class StatusesController : ControllerBase
    {
        private readonly PetCareContext _context;

        public StatusesController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StatusMaster>>> GetStatuses()
        {
            return await _context.StatusMasters.ToListAsync();
        }

        [HttpGet("{type}")]
        public async Task<ActionResult<IEnumerable<StatusMaster>>> GetStatusesByType(string type)
        {
            return await _context.StatusMasters
                .Where(s => s.StatusType.ToLower() == type.ToLower())
                .ToListAsync();
        }
    }
}
