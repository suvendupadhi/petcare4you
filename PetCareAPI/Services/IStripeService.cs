using PetCareAPI.Models;
using Stripe;

namespace PetCareAPI.Services
{
    public interface IStripeService
    {
        Task<Account> CreateConnectedAccountAsync(string email);
        Task<AccountLink> CreateAccountLinkAsync(string accountId, string returnUrl, string refreshUrl);
        Task<PaymentIntent> CreatePaymentIntentAsync(decimal amount, string providerStripeAccountId, int appointmentId);
        Task<Account> GetAccountAsync(string accountId);
    }
}
