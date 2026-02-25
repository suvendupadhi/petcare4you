    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using PetCareAPI.Constants;
    
    namespace PetCareAPI.Models
    {
        public abstract class BaseEntity
        {
            [Required]
            [StringLength(1)]
            [Column("row_status")]
            public string RowStatus { get; set; } = StatusConstants.RowStatus.Active;
    
            [Column("deleted_at")]
            public DateTimeOffset? DeletedAt { get; set; }
        }
    }
