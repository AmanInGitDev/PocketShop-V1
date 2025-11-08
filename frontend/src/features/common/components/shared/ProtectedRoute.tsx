/**
 * Protected Route Component
 * 
 * Protects routes that require authentication.
 * - Shows loading state during auth check (prevents flashing)
 * - Redirects to /login if not authenticated
 * - Preserves attempted URL for post-login redirect
 * - Handles authentication errors gracefully
 * - Prevents infinite redirect loops
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { LoadingScreen } from '@/features/common/components/LoadingScreen';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute - Requires authentication
 * 
 * Usage:
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session, error } = useAuth();
  const location = useLocation();

  // Show loading screen during initial auth check
  // This prevents route flashing and ensures we have accurate auth state
  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Handle authentication errors
  // Show a user-friendly error message instead of failing silently
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'An error occurred while checking your authentication. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Retry
            </button>
            <button
              onClick={() => window.location.href = ROUTES.LOGIN}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Login
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-600">
                Technical Details
              </summary>
              <pre className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded overflow-auto">
                {JSON.stringify({ error, location: location.pathname }, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  // If no user, redirect to login with current location preserved
  // This allows us to redirect back after successful login
  if (!user || !session) {
    return (
      <Navigate 
        to={ROUTES.LOGIN} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};
