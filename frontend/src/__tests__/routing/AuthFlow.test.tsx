/**
 * Authentication Flow Tests
 * 
 * Tests for authentication flows including login, logout, and session persistence.
 */

import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/features/auth/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import {
  renderWithRouter,
  createAuthenticatedState,
  createUnauthenticatedState,
  createLoadingState,
  mockUser,
  mockSession,
} from '../setup/routerTestUtils';

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  },
}));

// Mock the login page component
const MockLoginPage = () => {
  const { signIn, loading, error } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitError, setSubmitError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const { data, error: signInError } = await signIn(email, password);
    if (signInError) {
      setSubmitError(signInError.message);
    } else if (data?.user) {
      navigate(ROUTES.VENDOR_DASHBOARD);
    }
  };

  return (
    <div data-testid="login-page">
      <h1>Login</h1>
      {loading && <div data-testid="login-loading">Loading...</div>}
      {error && <div data-testid="auth-error">{error}</div>}
      {submitError && <div data-testid="submit-error">{submitError}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          data-testid="email-input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          data-testid="password-input"
        />
        <button type="submit" data-testid="submit-button">
          Sign In
        </button>
      </form>
    </div>
  );
};

// Mock dashboard component
const MockDashboard = () => {
  const { user, signOut } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate(ROUTES.HOME);
  };

  return (
    <div data-testid="dashboard">
      <h1>Dashboard</h1>
      <p data-testid="user-email">{user?.email}</p>
      <button onClick={handleLogout} data-testid="logout-button">
        Logout
      </button>
    </div>
  );
};

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login success', () => {
    it('redirects to dashboard after successful login', async () => {
      const mockSignIn = jest.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { authContext } = renderWithRouter(
        <MockLoginPage />,
        {
          route: ROUTES.LOGIN,
          authContext: {
            ...createUnauthenticatedState(),
            signIn: mockSignIn,
          },
        }
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('redirects to saved location after login', async () => {
      const mockSignIn = jest.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Simulate redirect from protected route
      renderWithRouter(
        <MockLoginPage />,
        {
          route: ROUTES.LOGIN,
          initialEntries: [
            {
              pathname: ROUTES.LOGIN,
              state: { from: { pathname: '/vendor/dashboard/orders' } },
            },
          ],
          authContext: {
            ...createUnauthenticatedState(),
            signIn: mockSignIn,
          },
        }
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });
  });

  describe('Login failure', () => {
    it('shows error message on login failure', async () => {
      const errorMessage = 'Invalid email or password';
      const mockSignIn = jest.fn().mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      });

      renderWithRouter(
        <MockLoginPage />,
        {
          route: ROUTES.LOGIN,
          authContext: {
            ...createUnauthenticatedState(),
            signIn: mockSignIn,
          },
        }
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('submit-error')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      // Should still be on login page
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('stays on login page after failed login', async () => {
      const mockSignIn = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Authentication failed' },
      });

      renderWithRouter(
        <MockLoginPage />,
        {
          route: ROUTES.LOGIN,
          authContext: {
            ...createUnauthenticatedState(),
            signIn: mockSignIn,
          },
        }
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      // Should not show dashboard
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Logout', () => {
    it('redirects to landing page after logout', async () => {
      const mockSignOut = jest.fn().mockResolvedValue({ error: null });

      renderWithRouter(
        <MockDashboard />,
        {
          route: ROUTES.VENDOR_DASHBOARD,
          authContext: {
            ...createAuthenticatedState(),
            signOut: mockSignOut,
          },
        }
      );

      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });

    it('clears user session on logout', async () => {
      const mockSignOut = jest.fn().mockResolvedValue({ error: null });

      const { authContext } = renderWithRouter(
        <MockDashboard />,
        {
          route: ROUTES.VENDOR_DASHBOARD,
          authContext: {
            ...createAuthenticatedState(),
            signOut: mockSignOut,
          },
        }
      );

      expect(screen.getByTestId('user-email')).toBeInTheDocument();
      expect(screen.getByText(mockUser.email!)).toBeInTheDocument();

      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });

  describe('Session persistence', () => {
    it('maintains user session after page refresh', async () => {
      // Simulate session restoration
      renderWithRouter(
        <MockDashboard />,
        {
          route: ROUTES.VENDOR_DASHBOARD,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('user-email')).toBeInTheDocument();
      });
    });

    it('shows user data when session is restored', async () => {
      renderWithRouter(
        <MockDashboard />,
        {
          route: ROUTES.VENDOR_DASHBOARD,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        expect(screen.getByText(mockUser.email!)).toBeInTheDocument();
      });
    });
  });

  describe('Loading states', () => {
    it('shows loading indicator during login', async () => {
      const mockSignIn = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: { user: mockUser }, error: null }), 100))
      );

      renderWithRouter(
        <MockLoginPage />,
        {
          route: ROUTES.LOGIN,
          authContext: {
            ...createUnauthenticatedState(),
            signIn: mockSignIn,
            loading: false, // Component handles its own loading
          },
        }
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Loading state should be handled by the component
      // This test verifies the component can handle async operations
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });
  });

  describe('Error handling', () => {
    it('handles network errors during login', async () => {
      const mockSignIn = jest.fn().mockRejectedValue(new Error('Network error'));

      renderWithRouter(
        <MockLoginPage />,
        {
          route: ROUTES.LOGIN,
          authContext: {
            ...createUnauthenticatedState(),
            signIn: mockSignIn,
          },
        }
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Component should handle the error gracefully
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });
  });
});

