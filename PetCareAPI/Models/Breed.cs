using System;
using System.Collections.Generic;

namespace PetCareAPI.Models
{
    public class Breed
    {
        public int Id { get; set; }
        public int PetTypeId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Origin { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual PetType? PetType { get; set; }
        public virtual ICollection<Pet> Pets { get; set; } = new List<Pet>();
    }
}
