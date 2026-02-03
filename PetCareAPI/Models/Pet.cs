using System;
using System.Collections.Generic;

namespace PetCareAPI.Models
{
    public class Pet
    {
        public int Id { get; set; }
        public int OwnerId { get; set; }
        public int PetTypeId { get; set; }
        public int? BreedId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int? Age { get; set; }
        public decimal? Weight { get; set; }
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
