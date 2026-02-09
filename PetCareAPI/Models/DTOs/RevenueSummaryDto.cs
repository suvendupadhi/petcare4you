namespace PetCareAPI.Models.DTOs
{
    public class RevenueSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal PendingRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public decimal WeeklyRevenue { get; set; }
        public double GrowthRate { get; set; }
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public decimal AverageRevenuePerAppointment { get; set; }
    }
}
