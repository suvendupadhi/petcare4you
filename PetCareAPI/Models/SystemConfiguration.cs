    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

namespace PetCareAPI.Models
{
    public class SystemConfiguration : BaseEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [Column("config_key")]
        public string Key { get; set; } = string.Empty;

        [Required]
        [Column("config_value")]
        public string Value { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
