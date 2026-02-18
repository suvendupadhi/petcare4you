using System;
using System.Collections.Generic;

namespace PetCareAPI.Models
{
    public class ServiceType
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string IconName { get; set; } = string.Empty; // For frontend icons
        public bool IsActive { get; set; } = true;
    }
}
