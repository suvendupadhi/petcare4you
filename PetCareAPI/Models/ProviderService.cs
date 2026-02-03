using System;

namespace PetCareAPI.Models
{
    public class ProviderService
    {
        public int Id { get; set; }
        public int ProviderId { get; set; }
        public int ServiceTypeId { get; set; }
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Provider? Provider { get; set; }
        public virtual ServiceType? ServiceType { get; set; }
    }
}
