# Full SDD workflow

## Workflow Steps

### [x] Step: Requirements

Create a Product Requirements Document (PRD) based on the feature description.

1. Review existing codebase to understand current architecture and patterns
2. Analyze the feature definition and identify unclear aspects
3. Ask the user for clarifications on aspects that significantly impact scope or user experience
4. Make reasonable decisions for minor details based on context and conventions
5. If user can't clarify, make a decision, state the assumption, and continue

Save the PRD to `d:\W\Asnet123\petcare\.zencoder\chats\cbe600ec-3e96-46fe-84de-f57026758339/requirements.md`.

### [x] Step: Technical Specification

Create a technical specification based on the PRD in `d:\W\Asnet123\petcare\.zencoder\chats\cbe600ec-3e96-46fe-84de-f57026758339/requirements.md`.

1. Review existing codebase architecture and identify reusable components
2. Define the implementation approach

Save to `d:\W\Asnet123\petcare\.zencoder\chats\cbe600ec-3e96-46fe-84de-f57026758339/spec.md` with:

- Technical context (language, dependencies)
- Implementation approach referencing existing code patterns
- Source code structure changes
- Data model / API / interface changes
- Delivery phases (incremental, testable milestones)
- Verification approach using project lint/test commands

### [x] Step: Planning

Create a detailed implementation plan based on `d:\W\Asnet123\petcare\.zencoder\chats\cbe600ec-3e96-46fe-84de-f57026758339/spec.md`.

1. Break down the work into concrete tasks
2. Each task should reference relevant contracts and include verification steps
3. Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function) or too broad (entire feature).

If the feature is trivial and doesn't warrant full specification, update this workflow to remove unnecessary steps and explain the reasoning to the user.

Save to `d:\W\Asnet123\petcare\.zencoder\chats\cbe600ec-3e96-46fe-84de-f57026758339/plan.md`.

### Step: Implementation

#### [x] 1. Backend: Implement Appointment Update
- [x] **Task**: Add `UpdateAppointmentAsync` to `IAppointmentService` and `AppointmentService`.
- [x] **Task**: Add `HttpPut` endpoint to `AppointmentsController`.
- [x] **Verification**: Verify with a manual test or by ensuring the code compiles.

#### [x] 2. Frontend Service: Update appointmentService
- [x] **Task**: Add `updateAppointment` method to `services/petCareService.ts`.
- [x] **Verification**: Ensure TypeScript compiles.

#### [x] 3. Mobile App: Enhance Booking Flow in `provider-detail.tsx`
- [x] **Task**: Add state for `petName` and `petType`.
- [x] **Task**: Add UI inputs for pet details in the booking section.
- [x] **Task**: Add logic to handle `rescheduleId` from query params.
- [x] **Task**: Update `handleBooking` to support both create and update.
- [x] **Verification**: Verify that pet details are sent to the API and that reschedule mode works.

#### [x] 4. Mobile App: Update List and Detail Views
- [x] **Task**: Update `app/appointments-owner.tsx` to handle "Reschedule" navigation.
- [x] **Task**: Update `app/appointment-detail.tsx` to handle "Reschedule" navigation and display all info.
- [x] **Verification**: Verify navigation flow from list/detail to booking screen with pre-filled data.

#### [x] 5. Bug Fixes and UX Improvements
- [x] **Task**: Register `IAppointmentService` in `PetCareAPI/Program.cs`.
- [x] **Task**: Make booking section visible by default in `provider-detail.tsx`.
- [x] **Task**: Add "No available dates" message in `provider-detail.tsx`.
- [x] **Task**: Fix PostgreSQL `DateTime` Kind mismatch error by enforcing `DateTimeKind.Utc` in `AppointmentService.cs` and `AvailabilityController.cs`.
- [x] **Task**: Simplify availability queries to use only `StartTime` and `ProviderId`, avoiding redundant date checks that fail due to timezone shifts.

#### [x] 6. Mobile App: Implement Logout
- [x] **Task**: Ensure logout is accessible from both Owner and Provider dashboards.
- [x] **Task**: Add Profile/User link to `provider-dashboard.tsx`.
- [x] **Task**: Verify `authService.logout()` implementation.
- [x] **Verification**: Logout successfully clears session and redirects to welcome screen.

#### [x] 7. Mobile App: Fix ProfileProviderScreen Reference Errors
- [x] **Task**: Fix `businessHours` is not defined error by using `mockBusinessHours`.
- [x] **Verification**: Screen renders correctly on web/mobile.

#### [x] 8. Debug and Fix Business Profile Update
- [x] **Task**: Add logging to `ProfileProviderScreen.handleSaveProfile` and `providerService.updateProvider`.
- [x] **Task**: Add logging to `ProvidersController.UpdateProvider` on the backend.
- [x] **Task**: Fix `editForm` to include `latitude` and `longitude` to prevent zeroing them out.
- [x] **Task**: Verify API call and backend response in logs.
- [x] **Verification**: Profile updates successfully without errors.

#### [x] 9. Cross-Platform Compatibility: Web Alerts
- [x] **Task**: Identify all `Alert.alert` calls in the mobile app.
- [x] **Task**: Implement conditional logic using `Platform.OS === 'web'` to use `window.alert` or `window.confirm`.
- [x] **Task**: Ensure `Platform` is imported where needed.
- [x] **Verification**: All alerts and confirmations show up correctly on `localhost:8081`.
