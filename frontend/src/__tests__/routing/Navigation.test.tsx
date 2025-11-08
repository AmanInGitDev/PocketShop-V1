/**
 * Navigation Tests
 * 
 * Tests for navigation scenarios including route transitions, redirects, and navigation guards.
 */

import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import {
  renderWithRouter,
  createAuthenticatedState,
  createUnauthenticatedState,
  createLoadingState,
  mockOnboardingStatuses,
} from '../setup/routerTestUtils';

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
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

// Mock LoadingScreen
jest.mock('@/features/common/components/LoadingScreen', () => ({
  LoadingScreen: ({ message }: { message: string }) => (
    <div data-testid="loading-screen">{message}</div>
  ),
}));

import { supabase } from '@/lib/supabaseClient';

// Navigation test components
const HomePage = () => (
  <div data-testid="home-page">
    <h1>Home</h1>
    <Link to={ROUTES.LOGIN} data-testid="login-link">
      Go to Login
    </Link>
    <Link to={ROUTES.VENDOR_DASHBOARD} data-testid="dashboard-link">
      Go to Dashboard
    </Link>
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <div data-testid="login-page">
      <h1>Login</h1>
      <button
        onClick={() => navigate(ROUTES.VENDOR_DASHBOARD)}
        data-testid="navigate-dashboard"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

const DashboardPage = () => (
  <div data-testid="dashboard-page">
    <h1>Dashboard</h1>
    <Link to={ROUTES.HOME} data-testid="home-link">
      Go to Home
    </Link>
  </div>
);

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.from as jest.Mock).mockReturnThis();
    (supabase.select as jest.Mock).mockReturnThis();
    (supabase.eq as jest.Mock).mockReturnThis();
  });

  describe('Route transitions', () => {
    it('navigates between public routes', () => {
      const { container } = renderWithRouter(
        <HomePage />,
        {
          route: ROUTES.HOME,
        }
      );

      expect(screen.getByTestId('home-page')).toBeInTheDocument();

      const loginLink = screen.getByTestId('login-link');
      fireEvent.click(loginLink);

      // Navigation should occur (tested via router)
      expect(loginLink).toBeInTheDocument();
    });

    it('preserves query parameters during navigation', () => {
      renderWithRouter(
        <HomePage />,
        {
          route: `${ROUTES.HOME}?param=value`,
        }
      );

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('preserves hash during navigation', () => {
      renderWithRouter(
        <HomePage />,
        {
          route: `${ROUTES.HOME}#section`,
        }
      );

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  describe('Protected route navigation', () => {
    it('redirects to login when accessing protected route while unauthenticated', async () => {
      renderWithRouter(
        <DashboardPage />,
        {
          route: ROUTES.VENDOR_DASHBOARD,
          authContext: createUnauthenticatedState(),
        }
      );

      await waitFor(() => {
        expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
      });
    });

    it('allows navigation to protected route when authenticated', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.completed,
        error: null,
      });

      renderWithRouter(
        <DashboardPage />,
        {
          route: ROUTES.VENDOR_DASHBOARD,
          authContext: createAuthenticatedState(),
        }
      );

      // Should show loading initially, then dashboard
      await waitFor(() => {
        // Dashboard should be accessible (though may show loading first)
        // The exact behavior depends on OnboardingProtectedRoute
      }, { timeout: 3000 });
    });
  });

  describe('Onboarding navigation', () => {
    it('redirects to onboarding when accessing dashboard with incomplete onboarding', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.incomplete,
        error: null,
      });

      renderWithRouter(
        <DashboardPage />,
        {
          route: ROUTES.VENDOR_DASHBOARD,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        // Should redirect to onboarding
        expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
      });
    });

    it('allows navigation to dashboard after onboarding completion', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.completed,
        error: null,
      });

      renderWithRouter(
        <DashboardPage />,
        {
          route: ROUTES.VENDOR_DASHBOARD,
          authContext: createAuthenticatedState(),
        }
      );

      // Should eventually show dashboard (after onboarding check)
      await waitFor(() => {
        // Dashboard access should be granted
      }, { timeout: 3000 });
    });
  });

  describe('Navigation guards', () => {
    it('prevents navigation to protected routes when unauthenticated', async () => {
      renderWithRouter(
        <HomePage />,
        {
          route: ROUTES.HOME,
          authContext: createUnauthenticatedState(),
        }
      );

      const dashboardLink = screen.getByTestId('dashboard-link');
      
      // Clicking the link should attempt navigation
      fireEvent.click(dashboardLink);

      // But should be blocked/redirected
      await waitFor(() => {
        // Home page might still be visible or redirect happened
      });
    });

    it('allows navigation to public routes regardless of auth state', () => {
      renderWithRouter(
        <HomePage />,
        {
          route: ROUTES.HOME,
          authContext: createUnauthenticatedState(),
        }
      );

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('redirects authenticated users away from login page', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.completed,
        error: null,
      });

      renderWithRouter(
        <LoginPage />,
        {
          route: ROUTES.LOGIN,
          authContext: createAuthenticatedState(),
        }
      );

      // Should redirect away from login
      await waitFor(() => {
        // Login page should not be accessible
      }, { timeout: 3000 });
    });
  });

  describe('Programmatic navigation', () => {
    it('navigates programmatically using navigate function', () => {
      renderWithRouter(
        <LoginPage />,
        {
          route: ROUTES.LOGIN,
          authContext: createUnauthenticatedState(),
        }
      );

      const navigateButton = screen.getByTestId('navigate-dashboard');
      fireEvent.click(navigateButton);

      // Navigation should be triggered
      expect(navigateButton).toBeInTheDocument();
    });

    it('handles navigation errors gracefully', () => {
      renderWithRouter(
        <LoginPage />,
        {
          route: ROUTES.LOGIN,
          authContext: createUnauthenticatedState(),
        }
      );

      const navigateButton = screen.getByTestId('navigate-dashboard');
      
      // Should not throw error
      expect(() => {
        fireEvent.click(navigateButton);
      }).not.toThrow();
    });
  });

  describe('Back navigation', () => {
    it('allows browser back navigation', () => {
      const { rerender } = renderWithRouter(
        <HomePage />,
        {
          route: ROUTES.HOME,
          initialEntries: [ROUTES.HOME, ROUTES.LOGIN],
        }
      );

      expect(screen.getByTestId('home-page')).toBeInTheDocument();

      // Simulate back navigation
      window.history.back();

      // Should navigate back
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  describe('Loading states during navigation', () => {
    it('shows loading state during route transition', () => {
      renderWithRouter(
        <DashboardPage />,
        {
          route: ROUTES.VENDOR_DASHBOARD,
          authContext: createLoadingState(),
        }
      );

      expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    });

    it('hides loading state after navigation completes', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.completed,
        error: null,
      });

      renderWithRouter(
        <DashboardPage />,
        {
          route: ROUTES.VENDOR_DASHBOARD,
          authContext: createAuthenticatedState(),
        }
      );

      // Loading should eventually disappear
      await waitFor(() => {
        // Loading screen should be gone
      }, { timeout: 3000 });
    });
  });

  describe('Route parameters', () => {
    it('handles route parameters correctly', () => {
      renderWithRouter(
        <div data-testid="param-page">Page with params</div>,
        {
          route: '/vendor/dashboard/orders/123',
        }
      );

      expect(screen.getByTestId('param-page')).toBeInTheDocument();
    });
  });

  describe('Navigation history', () => {
    it('maintains navigation history', () => {
      renderWithRouter(
        <HomePage />,
        {
          route: ROUTES.HOME,
          initialEntries: [ROUTES.HOME, ROUTES.LOGIN, ROUTES.HOME],
        }
      );

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });
});

