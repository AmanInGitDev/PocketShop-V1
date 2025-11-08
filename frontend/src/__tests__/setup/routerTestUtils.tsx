/**
 * Router Test Utilities
 * 
 * Helper functions for testing routing scenarios with React Router and Auth Context.
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '@/features/auth/context/AuthContext';
import type { User } from '@/features/common/types';
import type { Session } from '@supabase/supabase-js';
import { ROUTES } from '@/constants/routes';

/**
 * Mock user data for testing
 */
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'vendor',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock session data for testing
 */
export const mockSession: Session = {
  access_token: 'mock-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  refresh_token: 'mock-refresh-token',
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    confirmation_sent_at: null,
    recovery_sent_at: null,
    email_confirmed_at: '2024-01-01T00:00:00Z',
    invited_at: null,
    action_link: null,
    phone: null,
    confirmed_at: '2024-01-01T00:00:00Z',
    last_sign_in_at: '2024-01-01T00:00:00Z',
    role: 'authenticated',
    updated_at: '2024-01-01T00:00:00Z',
  },
} as Session;

/**
 * Mock auth context value
 */
export interface MockAuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: jest.Mock;
  signIn: jest.Mock;
  signOut: jest.Mock;
}

/**
 * Create a mock auth context value
 */
export const createMockAuthContext = (
  overrides: Partial<MockAuthContextValue> = {}
): MockAuthContextValue => ({
  user: null,
  session: null,
  loading: false,
  error: null,
  signUp: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
  signIn: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
  signOut: jest.fn().mockResolvedValue({ error: null }),
  ...overrides,
});

/**
 * Mock Auth Provider component
 */
export const MockAuthProvider: React.FC<{
  children: React.ReactNode;
  value?: MockAuthContextValue;
}> = ({ children, value = createMockAuthContext() }) => {
  return (
    <AuthContext.Provider value={value as any}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Options for renderWithRouter
 */
export interface RenderWithRouterOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  initialEntries?: string[];
  authContext?: Partial<MockAuthContextValue>;
}

/**
 * Render component with router and auth context
 */
export const renderWithRouter = (
  ui: React.ReactElement,
  options: RenderWithRouterOptions = {}
) => {
  const {
    route = '/',
    initialEntries = [route],
    authContext,
    ...renderOptions
  } = options;

  const authValue = createMockAuthContext(authContext);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <MockAuthProvider value={authValue}>
          {children}
        </MockAuthProvider>
      </MemoryRouter>
    );
  };

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    authContext: authValue,
  };
};

/**
 * Render component with full router setup (BrowserRouter)
 */
export const renderWithFullRouter = (
  ui: React.ReactElement,
  options: RenderWithRouterOptions = {}
) => {
  const {
    route = '/',
    authContext,
    ...renderOptions
  } = options;

  const authValue = createMockAuthContext(authContext);

  // Set initial route
  if (route !== '/') {
    window.history.pushState({}, '', route);
  }

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <BrowserRouter>
        <MockAuthProvider value={authValue}>
          {children}
        </MockAuthProvider>
      </BrowserRouter>
    );
  };

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    authContext: authValue,
  };
};

/**
 * Mock onboarding status responses
 */
export const mockOnboardingStatuses = {
  incomplete: { onboarding_status: 'incomplete' },
  basicInfo: { onboarding_status: 'basic_info' },
  operationalDetails: { onboarding_status: 'operational_details' },
  planningSelected: { onboarding_status: 'planning_selected' },
  completed: { onboarding_status: 'completed' },
};

/**
 * Wait for navigation to complete
 */
export const waitForNavigation = () => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};

/**
 * Create a mock Supabase client
 */
export const createMockSupabaseClient = () => {
  const mockFrom = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  const mockSingle = jest.fn().mockResolvedValue({
    data: null,
    error: { code: 'PGRST116', message: 'No rows returned' },
  });

  return {
    from: mockFrom,
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    // Chain methods for query builder
    _mockFrom: mockFrom,
    _mockSelect: mockSelect,
    _mockEq: mockEq,
    _mockSingle: mockSingle,
  };
};

/**
 * Mock vendor profile query response
 */
export const mockVendorProfileQuery = (
  supabaseMock: any,
  onboardingStatus: keyof typeof mockOnboardingStatuses = 'incomplete'
) => {
  const status = mockOnboardingStatuses[onboardingStatus];
  
  supabaseMock._mockFrom.mockReturnValue({
    select: supabaseMock._mockSelect,
  });
  
  supabaseMock._mockSelect.mockReturnValue({
    eq: supabaseMock._mockEq,
  });
  
  supabaseMock._mockEq.mockReturnValue({
    single: supabaseMock._mockSingle,
  });
  
  supabaseMock._mockSingle.mockResolvedValue({
    data: status,
    error: null,
  });
  
  return supabaseMock;
};

/**
 * Helper to create authenticated user state
 */
export const createAuthenticatedState = (
  onboardingStatus: keyof typeof mockOnboardingStatuses = 'completed'
) => {
  return {
    user: mockUser,
    session: mockSession,
    loading: false,
    error: null,
  };
};

/**
 * Helper to create unauthenticated user state
 */
export const createUnauthenticatedState = () => {
  return {
    user: null,
    session: null,
    loading: false,
    error: null,
  };
};

/**
 * Helper to create loading state
 */
export const createLoadingState = () => {
  return {
    user: null,
    session: null,
    loading: true,
    error: null,
  };
};

/**
 * Helper to create error state
 */
export const createErrorState = (errorMessage: string = 'Test error') => {
  return {
    user: null,
    session: null,
    loading: false,
    error: errorMessage,
  };
};

