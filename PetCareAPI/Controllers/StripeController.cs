using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Data;
using PetCareAPI.Models;
using PetCareAPI.Services;
using System.Security.Claims;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StripeController : ControllerBase
    {
        private readonly IStripeService _stripeService;
        private readonly PetCare4YouContext _context;
        private readonly IConfiguration _configuration;

        public StripeController(IStripeService stripeService, PetCare4YouContext context, IConfiguration configuration)
        {
            _stripeService = stripeService;
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("onboard")]
        public async Task<IActionResult> Onboard()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            
            if (provider == null) return NotFound("Provider not found");

            if (string.IsNullOrEmpty(provider.StripeAccountId))
            {
                var user = await _context.Users.FindAsync(userId);
                var account = await _stripeService.CreateConnectedAccountAsync(user!.Email);
                provider.StripeAccountId = account.Id;
                await _context.SaveChangesAsync();
            }

            var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "http://localhost:8081";
            var accountLink = await _stripeService.CreateAccountLinkAsync(
                provider.StripeAccountId,
                $"{baseUrl}/stripe-callback?status=success",
                $"{baseUrl}/stripe-callback?status=refresh"
            );

            return Ok(new { url = accountLink.Url });
        }

        [HttpGet("account-status")]
        public async Task<IActionResult> GetAccountStatus()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);

            if (provider == null) return NotFound("Provider not found");
            if (string.IsNullOrEmpty(provider.StripeAccountId)) return Ok(new { isConnected = false });

            var account = await _stripeService.GetAccountAsync(provider.StripeAccountId);
            provider.IsStripeConnected = account.DetailsSubmitted;
            await _context.SaveChangesAsync();

            return Ok(new { isConnected = provider.IsStripeConnected });
        }

        [HttpPost("create-payment-intent/{paymentId}")]
        public async Task<IActionResult> CreatePaymentIntent(int paymentId)
        {
            var payment = await _context.Payments
                .Include(p => p.Appointment)
                    .ThenInclude(a => a.Provider)
                .FirstOrDefaultAsync(p => p.Id == paymentId);

            if (payment == null) return NotFound("Payment not found");
            
            var provider = payment.Appointment?.Provider;
            if (provider == null || string.IsNullOrEmpty(provider.StripeAccountId) || !provider.IsStripeConnected)
            {
                return BadRequest("Provider is not set up for Stripe payments");
            }

            var intent = await _stripeService.CreatePaymentIntentAsync(
                payment.Amount, 
                provider.StripeAccountId, 
                payment.AppointmentId
            );

            payment.StripePaymentIntentId = intent.Id;
            payment.StripeClientSecret = intent.ClientSecret;
            await _context.SaveChangesAsync();

            return Ok(new { clientSecret = intent.ClientSecret });
        }
    }
}
