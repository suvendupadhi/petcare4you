using PetCareAPI.Models;

namespace PetCareAPI.Services
{
    public interface IAppointmentService
    {
        Task<Appointment?> GetAppointmentAsync(int id);
        Task<IEnumerable<Appointment>> GetOwnerAppointmentsAsync(int userId);
        Task<IEnumerable<Appointment>> GetProviderAppointmentsAsync(int userId);
        Task<Appointment?> CreateAppointmentAsync(int userId, Appointment appointment);
        Task<bool> UpdateStatusAsync(int appointmentId, int status, string? reason = null);
        Task<Appointment?> UpdateAppointmentAsync(int appointmentId, Appointment appointment);
    }
}
