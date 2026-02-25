using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PetCareAPI.Models
{
    public class User : BaseEntity
    {
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [Phone]
        [RegularExpression(@"^\+?[1-9]\d{1,14}$")]
        public string PhoneNumber { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Address { get; set; }

        public string? ProfileImageUrl { get; set; }
        public int RoleId { get; set; }
        public string? PasswordResetToken { get; set; }
        public DateTime? ResetTokenExpiry { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual UserRole? Role { get; set; }
        public virtual Provider? Provider { get; set; }
        public virtual ICollection<Pet> Pets { get; set; } = new List<Pet>();
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
