import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RegisterProviderPage from './RegisterProviderPage';

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

// Mock services
vi.mock('../services/petCare4YouService', () => ({
  authService: {
    register: vi.fn(),
  },
  serviceTypeService: {
    getServiceTypes: vi.fn().mockResolvedValue([
      { id: 1, name: 'Grooming' },
      { id: 2, name: 'Walking' },
    ]),
  },
}));

describe('RegisterProviderPage Validation', () => {
  it('shows validation errors when submitting empty form', async () => {
    render(
      <BrowserRouter>
        <RegisterProviderPage />
      </BrowserRouter>
    );

    // Wait for service types to load
    await waitFor(() => {
      expect(screen.getByText('Grooming')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /join as partner/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/business name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/hourly rate must be greater than 0/i)).toBeInTheDocument();
      expect(screen.getByText(/select at least one service/i)).toBeInTheDocument();
    });
  });

  it('shows error for weak password', async () => {
    render(
      <BrowserRouter>
        <RegisterProviderPage />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    
    const submitButton = screen.getByRole('button', { name: /join as partner/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/min 8 chars, 1 upper, 1 lower, 1 number, 1 special/i)).toBeInTheDocument();
    });
  });
});
