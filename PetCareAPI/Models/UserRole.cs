using System;
using System.Collections.Generic;

namespace PetCareAPI.Models
{
    public class UserRole : BaseEntity
    {
        public int Id { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}
