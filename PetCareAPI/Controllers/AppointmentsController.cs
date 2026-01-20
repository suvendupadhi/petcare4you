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
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly PetCareContext _context;

        public AppointmentsController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Unauthorized();

            if (user.UserType == "Provider")
            {
                var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
                if (provider == null)
                    return Ok(new List<Appointment>());

                return await _context.Appointments
                    .Where(a => a.ProviderId == provider.Id)
                    .OrderByDescending(a => a.AppointmentDate)
                    .ToListAsync();
            }
            else
            {
                return await _context.Appointments
                    .Where(a => a.OwnerId == userId)
                    .OrderByDescending(a => a.AppointmentDate)
                    .ToListAsync();
            }
        }

        [HttpPost]
        public async Task<ActionResult<Appointment>> CreateAppointment([FromBody] CreateAppointmentRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var appointment = new Appointment
            {
                OwnerId = int.Parse(userIdClaim.Value),
                ProviderId = request.ProviderId,
                AppointmentDate = request.AppointmentDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                PetName = request.PetName,
                PetType = request.PetType,
                Description = request.Description,
                TotalPrice = request.TotalPrice,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAppointments), new { id = appointment.Id }, appointment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] Appointment appointment)
        {
            var existing = await _context.Appointments.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Status = appointment.Status;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
