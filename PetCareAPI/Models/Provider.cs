using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace PetCareAPI.Models
{
    public class Provider
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal HourlyRate { get; set; }
        public decimal Rating { get; set; } = 5.0m;
        public int ReviewCount { get; set; } = 0;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? ProfileImageUrl { get; set; }
        public bool IsVerified { get; set; } = false;
        public string? StripeAccountId { get; set; }
        public bool IsStripeConnected { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual User? User { get; set; }
        public virtual ICollection<ProviderService> ProviderServices { get; set; } = new List<ProviderService>();
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public virtual ICollection<Availability> Availabilities { get; set; } = new List<Availability>();
        public virtual ICollection<ProviderPhoto> Photos { get; set; } = new List<ProviderPhoto>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

        [NotMapped]
        public virtual ICollection<ServiceType> ServiceTypes => ProviderServices?.Where(ps => ps?.ServiceType != null).Select(ps => ps.ServiceType!).ToList() ?? new List<ServiceType>();
    }
}
