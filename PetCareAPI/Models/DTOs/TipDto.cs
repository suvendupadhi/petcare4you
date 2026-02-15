namespace PetCareAPI.Models.DTOs
{
    public class TipCreateDto
    {
        public int? UserRoleId { get; set; }
        public int? ServiceTypeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }

    public class TipUpdateDto : TipCreateDto
    {
    }
}
