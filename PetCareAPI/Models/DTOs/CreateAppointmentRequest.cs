using System.ComponentModel.DataAnnotations;

namespace PetCareAPI.Models.DTOs
{
    public class CreateAppointmentRequest
    {
        [Required]
        public int ProviderId { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required]
        public string PetName { get; set; } = string.Empty;

        [Required]
        public string PetType { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public decimal TotalPrice { get; set; }
    }
}
