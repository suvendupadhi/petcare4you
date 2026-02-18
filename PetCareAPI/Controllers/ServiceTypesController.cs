using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Data;
using PetCareAPI.Models;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Route("api/service-types")]
    [AllowAnonymous]
    public class ServiceTypesController : ControllerBase
    {
        private readonly PetCareContext _context;

        public ServiceTypesController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceType>>> GetServiceTypes()
        {
            return await _context.ServiceTypes
                .Where(s => s.IsActive)
                .OrderBy(s => s.Name)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceType>> GetServiceType(int id)
        {
            var serviceType = await _context.ServiceTypes.FindAsync(id);

            if (serviceType == null)
            {
                return NotFound();
            }

            return serviceType;
        }
    }
}
