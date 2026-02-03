using System;

namespace PetCareAPI.Models
{
    public class StatusMaster
    {
        public int Id { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public string StatusType { get; set; } = string.Empty; // 'appointment', 'payment'
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
