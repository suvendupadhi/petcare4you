using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Constants;
using PetCareAPI.Data;
using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;
using System.Security.Claims;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly PetCare4YouContext _context;

        public PaymentsController(PetCare4YouContext context)
        {
            _context = context;
        }

        [HttpGet("provider")]
        public async Task<ActionResult<IEnumerable<Payment>>> GetProviderPayments()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null) return NotFound("Provider profile not found");

            // Sync missing payment records for confirmed/completed appointments
            var appointmentsWithoutPayment = await _context.Appointments
                .Where(a => a.ProviderId == provider.Id && 
                           (a.Status == StatusConstants.Appointment.Confirmed || a.Status == StatusConstants.Appointment.Completed) &&
                           !_context.Payments.Any(p => p.AppointmentId == a.Id))
                .ToListAsync();

            if (appointmentsWithoutPayment.Any())
            {
                foreach (var app in appointmentsWithoutPayment)
                {
                    _context.Payments.Add(new Payment
                    {
                        AppointmentId = app.Id,
                        UserId = app.OwnerId,
                        Amount = app.TotalPrice,
                        Status = StatusConstants.Payment.Pending,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                await _context.SaveChangesAsync();
            }

            var payments = await _context.Payments
                .Include(p => p.Appointment)
                    .ThenInclude(a => a.Owner)
                .Where(p => p.Appointment!.ProviderId == provider.Id)
                .OrderByDescending(p => p.CreatedAt) // Use CreatedAt since PaymentDate might be default for pending
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
            
            // Sync missing payment records for confirmed/completed appointments
            var appointmentsWithoutPayment = await _context.Appointments
                .Where(a => a.OwnerId == userId && 
                           (a.Status == StatusConstants.Appointment.Confirmed || a.Status == StatusConstants.Appointment.Completed) &&
                           !_context.Payments.Any(p => p.AppointmentId == a.Id))
                .ToListAsync();

            if (appointmentsWithoutPayment.Any())
            {
                foreach (var app in appointmentsWithoutPayment)
                {
                    _context.Payments.Add(new Payment
                    {
                        AppointmentId = app.Id,
                        UserId = userId,
                        Amount = app.TotalPrice,
                        Status = StatusConstants.Payment.Pending,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                await _context.SaveChangesAsync();
            }

            var payments = await _context.Payments
                .Include(p => p.Appointment)
                    .ThenInclude(a => a.Provider)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return payments;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Payment>> GetPayment(int id)
        {
            var payment = await _context.Payments
                .Include(p => p.Appointment)
                    .ThenInclude(a => a.Owner)
                .Include(p => p.Appointment)
                    .ThenInclude(a => a.Provider)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null) return NotFound();
            return Ok(payment);
        }

        [HttpGet("{id}/invoice")]
        public async Task<IActionResult> GetInvoice(int id)
        {
            var payment = await _context.Payments
                .Include(p => p.Appointment)
                    .ThenInclude(a => a.Owner)
                .Include(p => p.Appointment)
                    .ThenInclude(a => a.Provider)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null) return NotFound();

            // Generate PDF on the fly
            var pdfBytes = GenerateInvoicePdf(payment);
            payment.InvoicePdf = pdfBytes;
            await _context.SaveChangesAsync();

            return File(pdfBytes, "application/pdf", $"invoice_{id}.pdf");
        }

        [HttpPost("{id}/pay-cash")]
        public async Task<IActionResult> PayCash(int id, [FromBody] CashPaymentDto cashDto)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null) return NotFound();

            payment.Status = StatusConstants.Payment.Completed;
            payment.PaymentMethod = "Cash";
            payment.Amount = cashDto.Amount;
            payment.PaymentDate = DateTime.UtcNow;
            payment.TransactionId = $"CASH-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

            await _context.SaveChangesAsync();
            return Ok(payment);
        }

        private byte[] GenerateInvoicePdf(Payment payment)
        {
            using (var ms = new System.IO.MemoryStream())
            {
                var document = new iTextSharp.text.Document(iTextSharp.text.PageSize.A4, 50, 50, 50, 50);
                var writer = iTextSharp.text.pdf.PdfWriter.GetInstance(document, ms);
                document.Open();

                // Add title
                var titleFont = iTextSharp.text.FontFactory.GetFont(iTextSharp.text.FontFactory.HELVETICA_BOLD, 18);
                var title = new iTextSharp.text.Paragraph("PETCARE SERVICES - INVOICE", titleFont)
                {
                    Alignment = iTextSharp.text.Element.ALIGN_CENTER,
                    SpacingAfter = 20f
                };
                document.Add(title);

                // Add content
                var normalFont = iTextSharp.text.FontFactory.GetFont(iTextSharp.text.FontFactory.HELVETICA, 12);
                document.Add(new iTextSharp.text.Paragraph($"Invoice ID: {payment.Id}", normalFont));
                document.Add(new iTextSharp.text.Paragraph($"Date: {DateTime.UtcNow:yyyy-MM-dd}", normalFont));
                document.Add(new iTextSharp.text.Paragraph("----------------------------------", normalFont));
                document.Add(new iTextSharp.text.Paragraph($"Client: {payment.Appointment?.Owner?.FirstName} {payment.Appointment?.Owner?.LastName}", normalFont));
                document.Add(new iTextSharp.text.Paragraph($"Provider: {payment.Appointment?.Provider?.CompanyName}", normalFont));
                document.Add(new iTextSharp.text.Paragraph($"Pet: {payment.Appointment?.PetName} ({payment.Appointment?.PetType})", normalFont));
                document.Add(new iTextSharp.text.Paragraph($"Service Date: {payment.Appointment?.AppointmentDate:yyyy-MM-dd}", normalFont));
                document.Add(new iTextSharp.text.Paragraph($"Time: {payment.Appointment?.StartTime:HH:mm} - {payment.Appointment?.EndTime:HH:mm}", normalFont));
                document.Add(new iTextSharp.text.Paragraph("----------------------------------", normalFont));
                
                var totalFont = iTextSharp.text.FontFactory.GetFont(iTextSharp.text.FontFactory.HELVETICA_BOLD, 14);
                document.Add(new iTextSharp.text.Paragraph($"Total Amount: ${payment.Amount}", totalFont));
                document.Add(new iTextSharp.text.Paragraph($"Status: {(payment.Status == StatusConstants.Payment.Completed ? "Paid" : "Unpaid")}", normalFont));
                
                if (!string.IsNullOrEmpty(payment.PaymentMethod))
                {
                    document.Add(new iTextSharp.text.Paragraph($"Payment Method: {payment.PaymentMethod}", normalFont));
                }

                document.Add(new iTextSharp.text.Paragraph("----------------------------------", normalFont));
                document.Add(new iTextSharp.text.Paragraph("Thank you for using PetCare Services!", normalFont));

                document.Close();
                return ms.ToArray();
            }
        }

        public class CashPaymentDto
        {
            public decimal Amount { get; set; }
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
