using System;

namespace PetCareAPI.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public int OwnerId { get; set; }
        public int ProviderId { get; set; }
        public int Rating { get; set; } // 1-5
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Appointment? Appointment { get; set; }
        public virtual User? Owner { get; set; }
        public virtual Provider? Provider { get; set; }
    }
}
