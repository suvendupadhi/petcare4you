import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterOwnerScreen from './register-owner';
import { authService } from '@/services/petCareService';

// Mock authService
jest.mock('@/services/petCareService', () => ({
  authService: {
    register: jest.fn(),
  },
}));

// Mock components
jest.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => null,
}));

describe('RegisterOwnerScreen Validation', () => {
  it('shows validation errors when submitting empty form', async () => {
    const { getByText, getAllByText } = render(<RegisterOwnerScreen />);

    const submitButton = getByText('Create Account');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('First name is required')).toBeTruthy();
      expect(getByText('Last name is required')).toBeTruthy();
      expect(getByText('Email is required')).toBeTruthy();
      expect(getByText('Phone number is required')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  it('shows error for weak password', async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterOwnerScreen />);

    const passwordInput = getByPlaceholderText('Create a password');
    fireEvent.changeText(passwordInput, 'weak');
    
    const submitButton = getByText('Create Account');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Min 8 chars, 1 upper, 1 lower, 1 number, 1 special')).toBeTruthy();
    });
  });

  it('shows error for password mismatch', async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterOwnerScreen />);

    const passwordInput = getByPlaceholderText('Create a password');
    const confirmInput = getByPlaceholderText('Re-enter your password');
    
    fireEvent.changeText(passwordInput, 'Password123!');
    fireEvent.changeText(confirmInput, 'Different123!');
    
    const submitButton = getByText('Create Account');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Passwords do not match')).toBeTruthy();
    });
  });
});
