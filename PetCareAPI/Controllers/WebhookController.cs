using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Data;
using Stripe;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WebhookController : ControllerBase
    {
        private readonly PetCareContext _context;
        private readonly IConfiguration _configuration;

        public WebhookController(PetCareContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<IActionResult> Index()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    _configuration["Stripe:WebhookSecret"]
                );

                if (stripeEvent.Type == Events.PaymentIntentSucceeded)
                {
                    var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                    await HandlePaymentSucceeded(paymentIntent!);
                }
                else if (stripeEvent.Type == Events.AccountUpdated)
                {
                    var account = stripeEvent.Data.Object as Account;
                    await HandleAccountUpdated(account!);
                }

                return Ok();
            }
            catch (StripeException e)
            {
                return BadRequest();
            }
        }

        private async Task HandlePaymentSucceeded(PaymentIntent intent)
        {
            var payment = await _context.Payments
                .Include(p => p.Appointment)
                .FirstOrDefaultAsync(p => p.StripePaymentIntentId == intent.Id);

            if (payment != null)
            {
                payment.Status = "Paid";
                payment.PaymentDate = DateTime.UtcNow;
                payment.TransactionId = intent.Id;

                if (payment.Appointment != null)
                {
                    payment.Appointment.Status = "Confirmed";
                }

                await _context.SaveChangesAsync();
            }
        }

        private async Task HandleAccountUpdated(Account account)
        {
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.StripeAccountId == account.Id);
            if (provider != null)
            {
                provider.IsStripeConnected = account.DetailsSubmitted;
                await _context.SaveChangesAsync();
            }
        }
    }
}
