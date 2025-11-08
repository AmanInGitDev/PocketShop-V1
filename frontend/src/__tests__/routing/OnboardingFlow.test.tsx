/**
 * Onboarding Flow Tests
 * 
 * Tests for onboarding flow including stage access, completion, and redirects.
 */

import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { OnboardingProtectedRoute } from '@/features/common/components/shared/OnboardingProtectedRoute';
import { ROUTES } from '@/constants/routes';
import {
  renderWithRouter,
  createAuthenticatedState,
  mockOnboardingStatuses,
  mockUser,
  mockSession,
} from '../setup/routerTestUtils';

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

// Mock LoadingScreen component
jest.mock('@/features/common/components/LoadingScreen', () => ({
  LoadingScreen: ({ message }: { message: string }) => (
    <div data-testid="loading-screen">{message}</div>
  ),
}));

import { supabase } from '@/lib/supabaseClient';

// Test components for each onboarding stage
const OnboardingStage1 = () => <div data-testid="stage-1">Stage 1: Basic Info</div>;
const OnboardingStage2 = () => <div data-testid="stage-2">Stage 2: Operational Details</div>;
const OnboardingStage3 = () => <div data-testid="stage-3">Stage 3: Choose Plan</div>;
const OnboardingCompletion = () => <div data-testid="completion">Onboarding Complete</div>;
const Dashboard = () => <div data-testid="dashboard">Dashboard</div>;

describe('Onboarding Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset supabase mocks
    (supabase.from as jest.Mock).mockReturnThis();
    (supabase.select as jest.Mock).mockReturnThis();
    (supabase.eq as jest.Mock).mockReturnThis();
  });

  describe('Sequential stage access', () => {
    it('allows access to stage 1 without prerequisites', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.incomplete,
        error: null,
      });

      renderWithRouter(
        <OnboardingProtectedRoute stage={1}>
          <OnboardingStage1 />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_ONBOARDING_STAGE_1,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        expect(screen.getByTestId('stage-1')).toBeInTheDocument();
      });
    });

    it('allows access to stage 2 only after stage 1 completion', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.basicInfo,
        error: null,
      });

      renderWithRouter(
        <OnboardingProtectedRoute stage={2}>
          <OnboardingStage2 />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_ONBOARDING_STAGE_2,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        expect(screen.getByTestId('stage-2')).toBeInTheDocument();
      });
    });

    it('redirects to stage 1 if trying to access stage 2 without completing stage 1', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.incomplete,
        error: null,
      });

      renderWithRouter(
        <OnboardingProtectedRoute stage={2}>
          <OnboardingStage2 />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_ONBOARDING_STAGE_2,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        // Should redirect to stage 1
        expect(screen.queryByTestId('stage-2')).not.toBeInTheDocument();
      });
    });

    it('allows access to stage 3 only after stages 1 and 2 completion', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.operationalDetails,
        error: null,
      });

      renderWithRouter(
        <OnboardingProtectedRoute stage={3}>
          <OnboardingStage3 />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_ONBOARDING_STAGE_3,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        expect(screen.getByTestId('stage-3')).toBeInTheDocument();
      });
    });

    it('redirects to stage 2 if trying to access stage 3 without completing stage 2', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.basicInfo,
        error: null,
      });

      renderWithRouter(
        <OnboardingProtectedRoute stage={3}>
          <OnboardingStage3 />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_ONBOARDING_STAGE_3,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        // Should redirect to stage 2
        expect(screen.queryByTestId('stage-3')).not.toBeInTheDocument();
      });
    });
  });

  describe('Stage completion', () => {
    it('allows access to completion page after all stages are complete', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.completed,
        error: null,
      });

      renderWithRouter(
        <OnboardingProtectedRoute stage="completion">
          <OnboardingCompletion />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_ONBOARDING_COMPLETION,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        expect(screen.getByTestId('completion')).toBeInTheDocument();
      });
    });

    it('redirects to incomplete stage if trying to access completion without finishing all stages', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.operationalDetails,
        error: null,
      });

      renderWithRouter(
        <OnboardingProtectedRoute stage="completion">
          <OnboardingCompletion />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_ONBOARDING_COMPLETION,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        // Should redirect to stage 3 (first incomplete stage)
        expect(screen.queryByTestId('completion')).not.toBeInTheDocument();
      });
    });
  });

  describe('Manual URL manipulation', () => {
    it('redirects to correct stage when accessing invalid stage URL', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.basicInfo,
        error: null,
      });

      // Try to access stage 3 directly when only stage 1 is complete
      renderWithRouter(
        <OnboardingProtectedRoute stage={3}>
          <OnboardingStage3 />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_ONBOARDING_STAGE_3,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        // Should redirect to stage 2 (next incomplete stage)
        expect(screen.queryByTestId('stage-3')).not.toBeInTheDocument();
      });
    });

    it('allows access when URL matches user progress', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.operationalDetails,
        error: null,
      });

      renderWithRouter(
        <OnboardingProtectedRoute stage={3}>
          <OnboardingStage3 />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_ONBOARDING_STAGE_3,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        expect(screen.getByTestId('stage-3')).toBeInTheDocument();
      });
    });
  });

  describe('Onboarding completion', () => {
    it('enables dashboard access after onboarding completion', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.completed,
        error: null,
      });

      renderWithRouter(
        <OnboardingProtectedRoute requireCompletedOnboarding={true}>
          <Dashboard />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_DASHBOARD,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    it('redirects to onboarding if dashboard accessed before completion', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.incomplete,
        error: null,
      });

      renderWithRouter(
        <OnboardingProtectedRoute requireCompletedOnboarding={true}>
          <Dashboard />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_DASHBOARD,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        // Should redirect to onboarding stage 1
        expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
      });
    });

    it('redirects to appropriate stage based on progress when accessing dashboard', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.operationalDetails,
        error: null,
      });

      renderWithRouter(
        <OnboardingProtectedRoute requireCompletedOnboarding={true}>
          <Dashboard />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_DASHBOARD,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        // Should redirect to stage 3 (next incomplete stage)
        expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading states', () => {
    it('shows loading screen while checking onboarding status', () => {
      // Mock a delayed response
      (supabase.single as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          data: mockOnboardingStatuses.incomplete,
          error: null,
        }), 100))
      );

      renderWithRouter(
        <OnboardingProtectedRoute stage={1}>
          <OnboardingStage1 />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_ONBOARDING_STAGE_1,
          authContext: createAuthenticatedState(),
        }
      );

      // Should show loading initially
      expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    });

    it('hides loading screen after onboarding status is loaded', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockOnboardingStatuses.incomplete,
        error: null,
      });

      renderWithRouter(
        <OnboardingProtectedRoute stage={1}>
          <OnboardingStage1 />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_ONBOARDING_STAGE_1,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
        expect(screen.getByTestId('stage-1')).toBeInTheDocument();
      });
    });
  });

  describe('Database error handling', () => {
    it('treats database errors as incomplete onboarding', async () => {
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' },
      });

      renderWithRouter(
        <OnboardingProtectedRoute stage={1}>
          <OnboardingStage1 />
        </OnboardingProtectedRoute>,
        {
          route: ROUTES.VENDOR_ONBOARDING_STAGE_1,
          authContext: createAuthenticatedState(),
        }
      );

      await waitFor(() => {
        // Should still allow access to stage 1 (treated as incomplete)
        expect(screen.getByTestId('stage-1')).toBeInTheDocument();
      });
    });
  });
});

