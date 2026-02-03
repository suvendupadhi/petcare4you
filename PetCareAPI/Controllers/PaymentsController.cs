using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Constants;
using PetCareAPI.Data;
using PetCareAPI.Models;
using System.Security.Claims;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly PetCareContext _context;

        public PaymentsController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet("provider")]
        public async Task<ActionResult<IEnumerable<Payment>>> GetProviderPayments()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null) return NotFound("Provider profile not found");

            var payments = await _context.Payments
                .Include(p => p.Appointment)
                    .ThenInclude(a => a.Owner)
                .Where(p => p.Appointment!.ProviderId == provider.Id)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();

            return payments;
        }

        [HttpGet("owner")]
        public async Task<ActionResult<IEnumerable<Payment>>> GetOwnerPayments()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            
            var payments = await _context.Payments
                .Include(p => p.Appointment)
                    .ThenInclude(a => a.Provider)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();

            return payments;
        }

        [HttpPost]
        public async Task<ActionResult<Payment>> CreatePayment([FromBody] Payment payment)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            payment.UserId = userId;
            payment.CreatedAt = DateTime.UtcNow;
            payment.PaymentDate = DateTime.UtcNow;
            
            if (payment.Status == 0) payment.Status = StatusConstants.Payment.Pending;

            _context.Payments.Add(payment);
            
            // Also update appointment status if needed
            var appointment = await _context.Appointments.FindAsync(payment.AppointmentId);
            if (appointment != null && payment.Status == StatusConstants.Payment.Completed)
            {
                appointment.Status = StatusConstants.Appointment.Confirmed;
            }

            await _context.SaveChangesAsync();

            return Ok(payment);
        }
    }
}
