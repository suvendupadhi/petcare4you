using System;

namespace PetCareAPI.Models
{
    public class ProviderPhoto : BaseEntity
    {
        public int Id { get; set; }
        public int ProviderId { get; set; }
        public string Url { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Provider? Provider { get; set; }
    }
}
