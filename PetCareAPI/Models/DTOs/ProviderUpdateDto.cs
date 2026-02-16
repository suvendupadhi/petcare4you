using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PetCareAPI.Models.DTOs
{
    public class ProviderUpdateDto
    {
        [Required(ErrorMessage = "Company name is required")]
        [StringLength(200, MinimumLength = 3, ErrorMessage = "Company name must be between 3 and 200 characters")]
        public string CompanyName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required")]
        [StringLength(2000, MinimumLength = 10, ErrorMessage = "Description must be between 10 and 2000 characters")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Service types are required")]
        [MinLength(1, ErrorMessage = "At least one service type must be selected")]
        public List<int> ServiceTypeIds { get; set; } = new List<int>();

        [Required(ErrorMessage = "Hourly rate is required")]
        [Range(0.01, 1000.00, ErrorMessage = "Hourly rate must be between 0.01 and 1000.00")]
        public decimal HourlyRate { get; set; }

        [Required(ErrorMessage = "Address is required")]
        [StringLength(255, MinimumLength = 5, ErrorMessage = "Address must be between 5 and 255 characters")]
        public string Address { get; set; } = string.Empty;

        [Required(ErrorMessage = "City is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "City must be between 2 and 100 characters")]
        public string City { get; set; } = string.Empty;

        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }
}
