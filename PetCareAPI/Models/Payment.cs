using System;

namespace PetCareAPI.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public int Status { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string? StripePaymentIntentId { get; set; }
        public string? StripeClientSecret { get; set; }
        public byte[]? InvoicePdf { get; set; }
        public DateTime PaymentDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Appointment? Appointment { get; set; }
        public virtual User? User { get; set; }
    }
}
