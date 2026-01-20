using System;

namespace PetCareAPI.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
        public DateTime CreatedAt { get; set; }

        public virtual Appointment? Appointment { get; set; }
        public virtual User? User { get; set; }
    }
}
