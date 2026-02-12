using System;

namespace PetCareAPI.Models
{
    public class Tip
    {
        public int Id { get; set; }
        public int? UserRoleId { get; set; }
        public int? ServiceTypeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual UserRole? UserRole { get; set; }
        public virtual ServiceType? ServiceType { get; set; }
    }
}
