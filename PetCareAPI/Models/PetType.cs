using System;
using System.Collections.Generic;

namespace PetCareAPI.Models
{
    public class PetType
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<Breed> Breeds { get; set; } = new List<Breed>();
        public virtual ICollection<Pet> Pets { get; set; } = new List<Pet>();
    }
}
