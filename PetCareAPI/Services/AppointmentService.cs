using Microsoft.EntityFrameworkCore;
using PetCareAPI.Constants;
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

        public async Task<Appointment?> GetAppointmentAsync(int id)
        {
            return await _context.Appointments
                .Include(a => a.Provider)
                    .ThenInclude(p => p!.User)
                .Include(a => a.Owner)
                .Include(a => a.Pet)
                    .ThenInclude(p => p!.PetType)
                .Include(a => a.Payment)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Appointment>> GetOwnerAppointmentsAsync(int userId)
        {
            return await _context.Appointments
                .Include(a => a.Provider)
                    .ThenInclude(p => p!.User)
                .Include(a => a.Pet)
                    .ThenInclude(p => p!.PetType)
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
                .Include(a => a.Pet)
                    .ThenInclude(p => p!.PetType)
                .Where(a => a.ProviderId == provider.Id)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();
        }

        public async Task<Appointment?> CreateAppointmentAsync(int userId, Appointment appointment)
        {
            // Ensure UTC for PostgreSQL
            appointment.AppointmentDate = DateTime.SpecifyKind(appointment.AppointmentDate.Date, DateTimeKind.Utc);
            appointment.StartTime = DateTime.SpecifyKind(appointment.StartTime, DateTimeKind.Utc);
            appointment.EndTime = DateTime.SpecifyKind(appointment.EndTime, DateTimeKind.Utc);

            // If PetId is provided, ensure PetName and PetType are populated from the Pet entity
            if (appointment.PetId.HasValue)
            {
                var pet = await _context.Pets
                    .Include(p => p.PetType)
                    .FirstOrDefaultAsync(p => p.Id == appointment.PetId.Value);
                
                if (pet != null)
                {
                    appointment.PetName = pet.Name;
                    appointment.PetType = pet.PetType?.Name ?? string.Empty;
                }
            }

            // Validate availability - using StartTime which includes the date
            var availability = await _context.Availabilities
                .FirstOrDefaultAsync(a => a.ProviderId == appointment.ProviderId &&
                                         a.StartTime == appointment.StartTime &&
                                         !a.IsBooked);

            if (availability == null)
            {
                return null;
            }

            appointment.OwnerId = userId;
            appointment.Status = StatusConstants.Appointment.Pending;
            appointment.CreatedAt = DateTime.UtcNow;
            appointment.UpdatedAt = DateTime.UtcNow;

            // Mark availability as booked
            availability.IsBooked = true;

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return appointment;
        }

        public async Task<bool> UpdateStatusAsync(int appointmentId, int status)
        {
            var appointment = await _context.Appointments.FindAsync(appointmentId);
            if (appointment == null) return false;

            appointment.Status = status;
            appointment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Appointment?> UpdateAppointmentAsync(int appointmentId, Appointment updatedAppointment)
        {
            // Ensure UTC for PostgreSQL
            updatedAppointment.AppointmentDate = DateTime.SpecifyKind(updatedAppointment.AppointmentDate.Date, DateTimeKind.Utc);
            updatedAppointment.StartTime = DateTime.SpecifyKind(updatedAppointment.StartTime, DateTimeKind.Utc);
            updatedAppointment.EndTime = DateTime.SpecifyKind(updatedAppointment.EndTime, DateTimeKind.Utc);

            var appointment = await _context.Appointments.FindAsync(appointmentId);
            if (appointment == null) return null;

            // If time changed, handle availability
            if (appointment.AppointmentDate != updatedAppointment.AppointmentDate || 
                appointment.StartTime != updatedAppointment.StartTime)
            {
                // 1. Unbook old slot
                var oldAvailability = await _context.Availabilities
                    .FirstOrDefaultAsync(a => a.ProviderId == appointment.ProviderId && 
                                             a.StartTime == appointment.StartTime);
                if (oldAvailability != null)
                {
                    oldAvailability.IsBooked = false;
                }

                // 2. Book new slot
                var newAvailability = await _context.Availabilities
                    .FirstOrDefaultAsync(a => a.ProviderId == updatedAppointment.ProviderId && 
                                             a.StartTime == updatedAppointment.StartTime &&
                                             !a.IsBooked);
                
                if (newAvailability == null)
                {
                    // New slot not available, abort
                    return null;
                }
                newAvailability.IsBooked = true;

                appointment.AppointmentDate = updatedAppointment.AppointmentDate;
                appointment.StartTime = updatedAppointment.StartTime;
                appointment.EndTime = updatedAppointment.EndTime;
            }

            appointment.PetId = updatedAppointment.PetId;
            
            if (appointment.PetId.HasValue)
            {
                var pet = await _context.Pets
                    .Include(p => p.PetType)
                    .FirstOrDefaultAsync(p => p.Id == appointment.PetId.Value);
                
                if (pet != null)
                {
                    appointment.PetName = pet.Name;
                    appointment.PetType = pet.PetType?.Name ?? string.Empty;
                }
            }
            else
            {
                appointment.PetName = updatedAppointment.PetName;
                appointment.PetType = updatedAppointment.PetType;
            }

            appointment.Description = updatedAppointment.Description;
            appointment.TotalPrice = updatedAppointment.TotalPrice;
            appointment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return appointment;
        }
    }
}
