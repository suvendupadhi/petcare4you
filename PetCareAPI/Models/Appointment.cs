using System;

namespace PetCareAPI.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public int OwnerId { get; set; }
        public int ProviderId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PetName { get; set; } = string.Empty;
        public string PetType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual User? Owner { get; set; }
        public virtual Provider? Provider { get; set; }
        public virtual Payment? Payment { get; set; }
    }
}
