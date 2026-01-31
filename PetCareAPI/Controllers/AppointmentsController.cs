using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetCareAPI.Models;
using PetCareAPI.Services;
using System.Security.Claims;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentsController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Appointment>> GetAppointment(int id)
        {
            var appointment = await _appointmentService.GetAppointmentAsync(id);
            if (appointment == null) return NotFound();
            return Ok(appointment);
        }

        [HttpGet("owner")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetOwnerAppointments()
        {
            var userId = GetUserId();
            var appointments = await _appointmentService.GetOwnerAppointmentsAsync(userId);
            return Ok(appointments);
        }

        [HttpGet("provider")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetProviderAppointments()
        {
            var userId = GetUserId();
            var appointments = await _appointmentService.GetProviderAppointmentsAsync(userId);
            return Ok(appointments);
        }

        [HttpPost]
        public async Task<ActionResult<Appointment>> CreateAppointment([FromBody] Appointment appointment)
        {
            var userId = GetUserId();
            var result = await _appointmentService.CreateAppointmentAsync(userId, appointment);

            if (result == null)
            {
                return BadRequest("The selected time slot is no longer available.");
            }

            return CreatedAtAction(nameof(GetOwnerAppointments), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Appointment>> UpdateAppointment(int id, [FromBody] Appointment appointment)
        {
            var result = await _appointmentService.UpdateAppointmentAsync(id, appointment);
            if (result == null)
            {
                return BadRequest("The selected time slot is no longer available or appointment not found.");
            }

            return Ok(result);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto statusDto)
        {
            var result = await _appointmentService.UpdateStatusAsync(id, statusDto.Status);
            if (!result) return NotFound();

            return NoContent();
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        }

        public class StatusUpdateDto
        {
            public string Status { get; set; } = string.Empty;
        }
    }
}
