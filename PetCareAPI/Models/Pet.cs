using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PetCareAPI.Models
{
    public class Pet : BaseEntity
    {
        public int Id { get; set; }
        public int OwnerId { get; set; }

        [Required]
        public int PetTypeId { get; set; }

        public int? BreedId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Range(0, 30)]
        public int? Age { get; set; }

        [Range(0.1, 200)]
        public decimal? Weight { get; set; }

        [StringLength(1000)]
        public string? MedicalNotes { get; set; }
        public string? ProfileImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual User? Owner { get; set; }
        public virtual PetType? PetType { get; set; }
        public virtual Breed? Breed { get; set; }
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
