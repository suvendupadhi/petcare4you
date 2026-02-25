using System.ComponentModel.DataAnnotations;

namespace PetCareAPI.Models.DTOs
{
    public class UpdateProfileDto
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Phone]
        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }

        public string? ProfileImageUrl { get; set; }
    }
}
