using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetCareAPI.Models
{
    public class Tip : BaseEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int? UserRoleId { get; set; }
        public int? ServiceTypeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual UserRole? UserRole { get; set; }
        public virtual ServiceType? ServiceType { get; set; }
    }
}
