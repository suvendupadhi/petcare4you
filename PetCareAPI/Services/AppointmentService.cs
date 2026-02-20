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

            //return await _context.Appointments
            //    .Include(a => a.Owner)
            //    .Include(a => a.Pet)
            //        .ThenInclude(p => p!.PetType)
            //    .Where(a => a.ProviderId == provider.Id)
            //    .OrderByDescending(a => a.AppointmentDate)
            //    .ToListAsync();

            var appointments = await _context.Appointments
                .Include(a => a.Owner)
                .Include(a => a.Pet)
                    .ThenInclude(p => p!.PetType)
                .Where(a => a.Provider!.UserId == userId)
                .OrderByDescending(a => a.AppointmentDate)
                .Take(50) // or pass as parameter
                .ToListAsync();

            return appointments;
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
            
            // Create notification for provider
            var provider = await _context.Providers.FindAsync(appointment.ProviderId);
            if (provider != null)
            {
                var notification = new Notification
                {
                    UserId = provider.UserId,
                    Title = "New Booking Request",
                    Message = $"You have a new booking request for {appointment.PetName} on {appointment.AppointmentDate:MMM dd, yyyy}.",
                    Type = "Booking",
                    ReferenceId = appointment.Id.ToString(),
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }

            return appointment;
        }

        public async Task<bool> UpdateStatusAsync(int appointmentId, int status, string? reason = null)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Provider)
                .Include(a => a.Owner)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);
            
            if (appointment == null) return false;

            int oldStatus = appointment.Status;
            appointment.Status = status;
            appointment.UpdatedAt = DateTime.UtcNow;

            if (status == StatusConstants.Appointment.Declined && !string.IsNullOrEmpty(reason))
            {
                appointment.DeclineReason = reason;
            }

            // Create notification for owner/provider based on status change
            string statusName = status switch
            {
                StatusConstants.Appointment.Confirmed => "Confirmed",
                StatusConstants.Appointment.Completed => "Completed",
                StatusConstants.Appointment.Cancelled => "Cancelled",
                StatusConstants.Appointment.Declined => "Declined",
                _ => "Updated"
            };

            string message = $"Your booking for {appointment.PetName} on {appointment.AppointmentDate:MMM dd, yyyy} has been {statusName.ToLower()}.";
            if (status == StatusConstants.Appointment.Declined && !string.IsNullOrEmpty(reason))
            {
                message += $" Reason: {reason}";
            }

            var notification = new Notification
            {
                UserId = appointment.OwnerId, // Notify owner
                Title = $"Booking {statusName}",
                Message = message,
                Type = "StatusChange",
                ReferenceId = appointment.Id.ToString(),
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
            
            // If confirmed or completed, ensure a payment record exists
            if (status == StatusConstants.Appointment.Confirmed || status == StatusConstants.Appointment.Completed)
            {
                var existingPayment = await _context.Payments.FirstOrDefaultAsync(p => p.AppointmentId == appointment.Id);
                if (existingPayment == null)
                {
                    var payment = new Payment
                    {
                        AppointmentId = appointment.Id,
                        UserId = appointment.OwnerId,
                        Amount = appointment.TotalPrice,
                        Status = StatusConstants.Payment.Pending,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Payments.Add(payment);
                }
            }

            // If cancelled or declined, also notify provider and unbook slot
            if (status == StatusConstants.Appointment.Cancelled || status == StatusConstants.Appointment.Declined)
            {
                // Remove pending payment if it exists
                var pendingPayment = await _context.Payments.FirstOrDefaultAsync(p => p.AppointmentId == appointment.Id && p.Status == StatusConstants.Payment.Pending);
                if (pendingPayment != null)
                {
                    _context.Payments.Remove(pendingPayment);
                }

                if (appointment.Provider != null && status == StatusConstants.Appointment.Cancelled)
                {
                    var providerNotification = new Notification
                    {
                        UserId = appointment.Provider.UserId,
                        Title = "Booking Cancelled",
                        Message = $"The booking for {appointment.PetName} on {appointment.AppointmentDate:MMM dd, yyyy} has been cancelled.",
                        Type = "Cancellation",
                        ReferenceId = appointment.Id.ToString(),
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Notifications.Add(providerNotification);
                }

                var availability = await _context.Availabilities
                    .FirstOrDefaultAsync(a => a.ProviderId == appointment.ProviderId && 
                                             a.StartTime == appointment.StartTime);
                if (availability != null)
                {
                    availability.IsBooked = false;
                }
            }

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
                // 1. Check if the provider has explicitly opened this slot for the new day/time
                var newAvailability = await _context.Availabilities
                    .FirstOrDefaultAsync(a => a.ProviderId == updatedAppointment.ProviderId && 
                                             a.StartTime == updatedAppointment.StartTime);

                if (newAvailability == null)
                {
                    // Slot not found - provider hasn't opened this booking slot
                    return null;
                }

                if (newAvailability.IsBooked)
                {
                    // Slot exists but is already booked
                    return null;
                }

                // 2. Unbook old slot
                var oldAvailability = await _context.Availabilities
                    .FirstOrDefaultAsync(a => a.ProviderId == appointment.ProviderId && 
                                             a.StartTime == appointment.StartTime);
                if (oldAvailability != null)
                {
                    oldAvailability.IsBooked = false;
                }

                // 3. Book new slot
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

            // Update pending payment amount if it exists
            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.AppointmentId == appointmentId && p.Status == StatusConstants.Payment.Pending);
            if (payment != null)
            {
                payment.Amount = updatedAppointment.TotalPrice;
            }

            await _context.SaveChangesAsync();
            return appointment;
        }
    }
}
