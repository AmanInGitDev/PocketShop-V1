# Routing Tests

Comprehensive test suite for all routing scenarios in PocketShop-V1.

## Test Files

### 1. `ProtectedRoute.test.tsx`
Tests for protected routes that require authentication:
- Unauthenticated user access → redirects to login
- Authenticated user access → renders correctly
- Loading states during auth check
- Error handling for auth failures
- Session validation

### 2. `AuthFlow.test.tsx`
Tests for authentication flows:
- Login success → redirects to dashboard (or saved location)
- Login failure → shows error, stays on login page
- Logout → redirects to landing page
- Session persistence → user stays logged in after refresh
- Loading states during authentication

### 3. `OnboardingFlow.test.tsx`
Tests for onboarding flow:
- Sequential stage access → cannot skip stages
- Stage completion → updates database
- Manual URL manipulation → redirects to correct stage
- Onboarding completion → enables dashboard access
- Database error handling

### 4. `ErrorHandling.test.tsx`
Tests for error scenarios:
- Invalid route → shows 404 page
- Component error → error boundary catches
- Network error → shows appropriate message
- Expired session → redirects to login
- Error recovery and retry mechanisms

### 5. `Navigation.test.tsx`
Tests for navigation scenarios:
- Route transitions between public routes
- Protected route navigation guards
- Onboarding navigation flow
- Programmatic navigation
- Browser back navigation
- Route parameters and query strings

## Test Utilities

### `routerTestUtils.tsx`
Helper functions for testing:
- `renderWithRouter()` - Render components with router and auth context
- `createAuthenticatedState()` - Create mock authenticated user state
- `createUnauthenticatedState()` - Create mock unauthenticated state
- `createLoadingState()` - Create mock loading state
- `createErrorState()` - Create mock error state
- `mockOnboardingStatuses` - Mock onboarding status responses

## Running Tests

```bash
# Run all routing tests
npm test -- src/__tests__/routing

# Run specific test file
npm test -- ProtectedRoute.test.tsx

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Test Coverage

The test suite covers:
- ✅ All protected route scenarios
- ✅ Complete authentication flow
- ✅ Full onboarding flow with stage validation
- ✅ Error handling and recovery
- ✅ Navigation guards and redirects
- ✅ Loading states
- ✅ Session management

## Mocking

Tests use mocks for:
- Supabase client (`@/lib/supabaseClient`)
- LoadingScreen component
- React Router navigation
- Authentication context

## Writing New Tests

When adding new routing tests:

1. Use `renderWithRouter()` from test utilities
2. Mock Supabase client for database operations
3. Use `createAuthenticatedState()` or `createUnauthenticatedState()` for auth scenarios
4. Mock onboarding statuses using `mockOnboardingStatuses`
5. Test both success and error scenarios
6. Verify loading states
7. Test navigation redirects

## Example Test

```typescript
import { renderWithRouter, createAuthenticatedState } from '../setup/routerTestUtils';

it('allows access to protected route when authenticated', async () => {
  renderWithRouter(
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>,
    {
      route: ROUTES.VENDOR_DASHBOARD,
      authContext: createAuthenticatedState(),
    }
  );

  await waitFor(() => {
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });
});
```

## Notes

- Tests use Jest and React Testing Library
- TypeScript is used for type safety
- All tests are isolated and don't depend on external services
- Mocks are reset between tests
- Console errors are suppressed for error boundary tests

