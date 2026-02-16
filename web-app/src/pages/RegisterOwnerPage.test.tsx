import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RegisterOwnerPage from './RegisterOwnerPage';

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
  };
});

// Mock authService
vi.mock('../services/petCareService', () => ({
  authService: {
    register: vi.fn(),
  },
}));

describe('RegisterOwnerPage Validation', () => {
  it('shows validation errors when submitting empty form', async () => {
    render(
      <BrowserRouter>
        <RegisterOwnerPage />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be 8\+ chars/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument();
    });
  });

  it('shows error for weak password', async () => {
    render(
      <BrowserRouter>
        <RegisterOwnerPage />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be 8\+ chars/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid email', async () => {
    render(
      <BrowserRouter>
        <RegisterOwnerPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('john@example.com');
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });
});
