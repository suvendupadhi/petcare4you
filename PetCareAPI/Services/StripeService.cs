using PetCareAPI.Models;
using Stripe;

namespace PetCareAPI.Services
{
    public class StripeService : IStripeService
    {
        private readonly IConfiguration _configuration;

        public StripeService(IConfiguration configuration)
        {
            _configuration = configuration;
            StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
        }

        public async Task<Account> CreateConnectedAccountAsync(string email)
        {
            var options = new AccountCreateOptions
            {
                Type = "express",
                Email = email,
                Capabilities = new AccountCapabilitiesOptions
                {
                    CardPayments = new AccountCapabilitiesCardPaymentsOptions { Requested = true },
                    Transfers = new AccountCapabilitiesTransfersOptions { Requested = true },
                },
            };

            var service = new AccountService();
            return await service.CreateAsync(options);
        }

        public async Task<AccountLink> CreateAccountLinkAsync(string accountId, string returnUrl, string refreshUrl)
        {
            var options = new AccountLinkCreateOptions
            {
                Account = accountId,
                RefreshUrl = refreshUrl,
                ReturnUrl = returnUrl,
                Type = "account_onboarding",
            };

            var service = new AccountLinkService();
            return await service.CreateAsync(options);
        }

        public async Task<PaymentIntent> CreatePaymentIntentAsync(decimal amount, string providerStripeAccountId, int appointmentId)
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(amount * 100), // Convert to cents
                Currency = "usd",
                PaymentMethodTypes = new List<string> { "card" },
                TransferData = new PaymentIntentTransferDataOptions
                {
                    Destination = providerStripeAccountId,
                },
                Metadata = new Dictionary<string, string>
                {
                    { "AppointmentId", appointmentId.ToString() }
                },
                // You can also add ApplicationFeeAmount here if you want to take a cut
                // ApplicationFeeAmount = (long)(amount * 100 * 0.1m), // 10% fee
            };

            var service = new PaymentIntentService();
            return await service.CreateAsync(options);
        }

        public async Task<Account> GetAccountAsync(string accountId)
        {
            var service = new AccountService();
            return await service.GetAsync(accountId);
        }
    }
}
