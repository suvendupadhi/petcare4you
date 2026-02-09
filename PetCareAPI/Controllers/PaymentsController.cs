using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Constants;
using PetCareAPI.Data;
using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;
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

        [HttpGet("revenue-summary")]
        public async Task<ActionResult<RevenueSummaryDto>> GetRevenueSummary()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null) return NotFound("Provider profile not found");

            var payments = await _context.Payments
                .Include(p => p.Appointment)
                .Where(p => p.Appointment!.ProviderId == provider.Id)
                .ToListAsync();

            var now = DateTime.UtcNow;
            var firstDayOfMonth = new DateTime(now.Year, now.Month, 1);
            var sevenDaysAgo = now.AddDays(-7);
            var lastMonthStart = firstDayOfMonth.AddMonths(-1);

            var summary = new RevenueSummaryDto
            {
                TotalRevenue = payments.Where(p => p.Status == StatusConstants.Payment.Completed).Sum(p => p.Amount),
                PendingRevenue = payments.Where(p => p.Status == StatusConstants.Payment.Pending).Sum(p => p.Amount),
                MonthlyRevenue = payments.Where(p => p.Status == StatusConstants.Payment.Completed && p.PaymentDate >= firstDayOfMonth).Sum(p => p.Amount),
                WeeklyRevenue = payments.Where(p => p.Status == StatusConstants.Payment.Completed && p.PaymentDate >= sevenDaysAgo).Sum(p => p.Amount),
                TotalAppointments = await _context.Appointments.CountAsync(a => a.ProviderId == provider.Id),
                CompletedAppointments = await _context.Appointments.CountAsync(a => a.ProviderId == provider.Id && a.Status == StatusConstants.Appointment.Completed)
            };

            var lastMonthRevenue = payments.Where(p => p.Status == StatusConstants.Payment.Completed && p.PaymentDate >= lastMonthStart && p.PaymentDate < firstDayOfMonth).Sum(p => p.Amount);
            if (lastMonthRevenue > 0)
            {
                summary.GrowthRate = (double)((summary.MonthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100);
            }
            else if (summary.MonthlyRevenue > 0)
            {
                summary.GrowthRate = 100;
            }

            if (summary.CompletedAppointments > 0)
            {
                summary.AverageRevenuePerAppointment = summary.TotalRevenue / summary.CompletedAppointments;
            }

            return summary;
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
