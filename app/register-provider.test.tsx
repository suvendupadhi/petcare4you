import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterProviderScreen from './register-provider';
import { serviceTypeService } from '@/services/petCareService';

// Mock serviceTypeService
jest.mock('@/services/petCareService', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
  },
  providerService: {
    createProvider: jest.fn(),
  },
  serviceTypeService: {
    getServiceTypes: jest.fn(() => Promise.resolve([
      { id: 1, name: 'Grooming' },
      { id: 2, name: 'Boarding' },
    ])),
  },
}));

// Mock MultiSelect as it might use complex styles or nativewind features
jest.mock('@/components/MultiSelect', () => ({
  MultiSelect: ({ onValueChange }: any) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity testID="mock-multiselect" onPress={() => onValueChange([1])}>
        <Text>Mock MultiSelect</Text>
      </TouchableOpacity>
    );
  },
}));

// Mock components
jest.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => null,
}));

describe('RegisterProviderScreen Validation', () => {
  it('shows validation errors when submitting empty form', async () => {
    const { getByText, getAllByText } = render(<RegisterProviderScreen />);
    
    // Find the register button
    const registerButton = getByText('Create Business Account');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(getByText('Business name is required')).toBeTruthy();
      expect(getByText('Owner first name is required')).toBeTruthy();
      expect(getByText('Owner last name is required')).toBeTruthy();
      expect(getByText('City is required')).toBeTruthy();
      expect(getByText('Address is required')).toBeTruthy();
      expect(getByText('Business phone is required')).toBeTruthy();
      expect(getByText('Business email is required')).toBeTruthy();
      expect(getByText('Select at least one service type')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  it('shows error for weak password', async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterProviderScreen />);
    
    const passwordInput = getByPlaceholderText('Create a strong password');
    fireEvent.changeText(passwordInput, 'weak');
    
    const registerButton = getByText('Create Business Account');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(getByText('Min 8 chars, 1 upper, 1 lower, 1 number, 1 special')).toBeTruthy();
    });
  });

  it('shows error for password mismatch', async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterProviderScreen />);
    
    const passwordInput = getByPlaceholderText('Create a strong password');
    const confirmInput = getByPlaceholderText('Confirm your password');
    
    fireEvent.changeText(passwordInput, 'Password123!');
    fireEvent.changeText(confirmInput, 'Different123!');
    
    const registerButton = getByText('Create Business Account');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(getByText('Passwords do not match')).toBeTruthy();
    });
  });
});
