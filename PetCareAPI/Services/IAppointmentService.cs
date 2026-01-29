using PetCareAPI.Models;

namespace PetCareAPI.Services
{
    public interface IAppointmentService
    {
        Task<IEnumerable<Appointment>> GetOwnerAppointmentsAsync(int userId);
        Task<IEnumerable<Appointment>> GetProviderAppointmentsAsync(int userId);
        Task<Appointment?> CreateAppointmentAsync(int userId, Appointment appointment);
        Task<bool> UpdateStatusAsync(int appointmentId, string status);
    }
}
