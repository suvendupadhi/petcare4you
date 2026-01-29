using Microsoft.EntityFrameworkCore;
using PetCareAPI.Data;
using PetCareAPI.Models;

namespace PetCareAPI.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly PetCareContext _context;

        public AppointmentService(PetCareContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Appointment>> GetOwnerAppointmentsAsync(int userId)
        {
            return await _context.Appointments
                .Include(a => a.Provider)
                .Where(a => a.OwnerId == userId)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetProviderAppointmentsAsync(int userId)
        {
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null) return Enumerable.Empty<Appointment>();

            return await _context.Appointments
                .Include(a => a.Owner)
                .Where(a => a.ProviderId == provider.Id)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();
        }

        public async Task<Appointment?> CreateAppointmentAsync(int userId, Appointment appointment)
        {
            // Validate availability
            var availability = await _context.Availabilities
                .FirstOrDefaultAsync(a => a.ProviderId == appointment.ProviderId && 
                                         a.Date.Date == appointment.AppointmentDate.Date &&
                                         a.StartTime == appointment.StartTime &&
                                         !a.IsBooked);

            if (availability == null)
            {
                return null;
            }

            appointment.OwnerId = userId;
            appointment.Status = "pending";
            appointment.CreatedAt = DateTime.UtcNow;
            appointment.UpdatedAt = DateTime.UtcNow;

            // Mark availability as booked
            availability.IsBooked = true;

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return appointment;
        }

        public async Task<bool> UpdateStatusAsync(int appointmentId, string status)
        {
            var appointment = await _context.Appointments.FindAsync(appointmentId);
            if (appointment == null) return false;

            appointment.Status = status;
            appointment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
