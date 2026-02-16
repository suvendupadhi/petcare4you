# Test Plan: PetCare Services Recent Enhancements

This document outlines the testing strategy for the recent features and security enhancements implemented in the PetCare platform.

## 1. Password Management (Security)
### 1.1 Forgot Password / Reset Password
- **Test Case**: Request password reset with a registered email.
- **Expected Result**: API sends success response; Reset token is generated (verified via DB).
- **Test Case**: Reset password using a valid token and new password (meeting complexity rules).
- **Expected Result**: Password is updated; old password no longer works.
- **Test Case**: Reset password with an invalid or expired token.
- **Expected Result**: API returns 400 Bad Request with descriptive error.

### 1.2 Change Password (Logged-in)
- **Test Case**: Change password with correct current password and valid new password.
- **Expected Result**: Password updated successfully.
- **Test Case**: Change password with incorrect current password.
- **Expected Result**: API returns 401 Unauthorized or 400 Bad Request.

## 2. Tips Configuration System (CRUD)
### 2.1 Tips Management
- **Test Case**: Create a new tip for 'Owner' role and 'Grooming' category.
- **Expected Result**: Tip created successfully with unique ID.
- **Test Case**: Update an existing tip's content and target role.
- **Expected Result**: Changes reflected in subsequent GET requests.
- **Test Case**: Delete a tip.
- **Expected Result**: Tip is removed and no longer returned in lists.
- **Test Case**: Verify ID sequence synchronization (prevent duplicate key errors).
- **Expected Result**: Successive creates do not fail with "duplicate key" after manual SQL interventions.

## 3. Search Optimization
### 3.1 Provider Search by City
- **Test Case**: Search with mixed case (e.g., "NeW yOrK").
- **Expected Result**: Returns providers in "New York".
- **Test Case**: Search with extra spaces (e.g., "  New   York  ").
- **Expected Result**: Returns providers in "New York".

## 4. Industry-Standard Validation
### 4.1 Backend (API) Validation
- **Test Case**: Register with invalid email format.
- **Expected Result**: 400 Bad Request with email validation error.
- **Test Case**: Register with short password (< 8 chars) or missing complexity (no uppercase/digit/special).
- **Expected Result**: 400 Bad Request with password policy details.
- **Test Case**: Register with invalid phone number format.
- **Expected Result**: 400 Bad Request with phone validation error.

### 4.2 Frontend (UI) Validation
- **Test Case**: Submit registration form with empty required fields.
- **Expected Result**: UI shows real-time validation messages; Submit button remains disabled or shows errors.
- **Test Case**: Password strength indicator/guidance appears as user types.
- **Expected Result**: Real-time feedback on meeting password requirements.

## 5. UI/UX Improvements
### 5.1 Empty State Handling
- **Test Case**: View Dashboard with no upcoming appointments.
- **Expected Result**: "See All" button is disabled; proper empty state message shown.

## 6. Automated Testing Strategy
- **API**: Integration tests using xUnit and `Microsoft.AspNetCore.Mvc.Testing`.
- **Frontend**: Unit and component tests for validation logic.
