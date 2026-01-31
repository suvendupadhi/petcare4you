# Technical Specification - Appointment Booking and Management

## 1. Technical Context
- **Backend**: ASP.NET Core 7.0, C#, Entity Framework Core, Cassandra (simulated via EF Core with snake_case mapping).
- **Frontend**: React Native (Expo), TypeScript, NativeWind (Tailwind CSS).
- **Navigation**: Expo Router (file-based).

## 2. Implementation Approach

### 2.1 Backend Changes
- **IAppointmentService.cs**: Add `Task<bool> UpdateAppointmentAsync(int appointmentId, Appointment appointment)`.
- **AppointmentService.cs**: Implement `UpdateAppointmentAsync`. It should update `AppointmentDate`, `StartTime`, `EndTime`, `PetName`, `PetType`, and `Description`.
- **AppointmentsController.cs**: Add `HttpPut("{id}")` endpoint that calls `UpdateAppointmentAsync`.

### 2.2 Frontend Service Changes
- **services/petCareService.ts**:
    - Add `updateAppointment: (id: number, appointmentData: any) => Promise<void>` to `appointmentService`.

### 2.3 Mobile App Enhancements

#### `app/provider-detail.tsx`
- Add state for `petName` and `petType`.
- Add TextInput components for `petName` and `petType` in the booking section.
- Detect "reschedule mode" via a new query parameter `rescheduleId`.
- If `rescheduleId` is present, fetch the existing appointment details to pre-fill the form.
- Change the "Book Now" button to "Update Appointment" and call `updateAppointment` instead of `createAppointment`.

#### `app/appointments-owner.tsx`
- Update the list items to show `petName` and `petType`.
- Ensure the "Reschedule" button navigates to `/provider-detail?id={providerId}&rescheduleId={appointmentId}`.

#### `app/appointment-detail.tsx`
- Ensure all fields (Pet info, Provider contact) are correctly displayed from the `Appointment` object.
- Implement the "Reschedule" button to navigate to `/provider-detail?id={providerId}&rescheduleId={appointmentId}`.

## 3. Data Model Changes
No structural changes to the database schema are required, as `PetName` and `PetType` already exist in the `Appointment` model.

## 4. Verification Approach
- **Manual Testing**:
    - Book a new appointment with custom pet details.
    - View the appointment in the list and detail screens.
    - Reschedule the appointment and verify the changes in the list and detail screens.
    - Cancel an appointment and verify its status.
- **Linting**: Run `npm run lint` (if available) to ensure code quality.
