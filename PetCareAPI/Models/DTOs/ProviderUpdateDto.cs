using System.Collections.Generic;

namespace PetCareAPI.Models.DTOs
{
    public class ProviderUpdateDto
    {
        public string CompanyName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<int> ServiceTypeIds { get; set; } = new List<int>();
        public decimal HourlyRate { get; set; }
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
    }
}
