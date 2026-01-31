# Product Requirements Document (PRD) - Appointment Booking and Management

## 1. Overview
The goal of this feature is to provide a complete workflow for Pet Owners to book services with Pet Care Providers and manage those bookings through the mobile application.

## 2. User Stories
- As a Pet Owner, I want to see a provider's availability so I can choose a suitable time for my pet.
- As a Pet Owner, I want to book an appointment by providing my pet's details and selecting a service.
- As a Pet Owner, I want to view all my upcoming and past appointments in one place.
- As a Pet Owner, I want to see the detailed information of a specific appointment, including provider contact info and payment status.
- As a Pet Owner, I want to cancel an appointment if I can no longer make it.
- As a Pet Owner, I want to reschedule an appointment to a different date or time.

## 3. Functional Requirements

### 3.1 Booking Flow (`provider-detail.tsx`)
- **Pet Details**: Users must be able to enter/select Pet Name and Pet Type (Dog, Cat, etc.) instead of using hardcoded values.
- **Service Selection**: Users select the service type (defaulted to provider's primary service).
- **Date/Time Selection**: Users must select an available slot from the provider's availability list.
- **Confirmation**: After successful booking, the user should be redirected to the dashboard or appointments list.

### 3.2 Appointment Management (`appointments-owner.tsx`)
- **Tabs**: Separate views for "Upcoming" and "Past" appointments.
- **Status Indicators**: Visual cues for Confirmed, Pending, Completed, and Cancelled statuses.
- **Quick Actions**: Ability to cancel or view details directly from the list.

### 3.3 Appointment Details (`appointment-detail.tsx`)
- **Information Display**: Show provider details, pet details, service info, and price.
- **Contact Actions**: Call, Email, or Get Directions to the provider.
- **Payment**: Option to pay for the appointment if not already paid.
- **Reschedule**: Navigation to a rescheduling flow.

### 3.4 Rescheduling Flow
- **Initiation**: From the Appointment Details or List screen.
- **Logic**: The user is taken back to the provider's booking interface. Upon selecting a new time, the existing appointment is updated with the new date/time.

## 4. Technical Constraints / Decisions
- **Pet Management**: Since there is no `Pets` table, we will use text inputs for Pet Name and Pet Type in the booking form for now.
- **Rescheduling**: We will add an `UpdateAppointmentAsync` method to the backend API to handle changes to date/time.
- **API Integration**: All actions (book, cancel, reschedule) must be persisted in the Cassandra database via the ASP.NET Core API.

## 5. Success Metrics
- Users can successfully book an appointment and see it in their "Upcoming" list.
- Users can successfully cancel an appointment and see its status change.
- Users can successfully change the date/time of an existing appointment.
