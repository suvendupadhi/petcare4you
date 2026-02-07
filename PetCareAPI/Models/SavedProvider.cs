using System;

namespace PetCareAPI.Models
{
    public class SavedProvider
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ProviderId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual User? User { get; set; }
        public virtual Provider? Provider { get; set; }
    }
}
