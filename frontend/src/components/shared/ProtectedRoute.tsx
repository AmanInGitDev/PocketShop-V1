import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes based on authentication and onboarding status.
 * 
 * @param requireAuth - If true, redirects to login if not authenticated
 * @param requireOnboarding - If true, redirects to onboarding if not completed
 * @param redirectTo - Custom redirect path (defaults to /login for auth, /vendor/onboarding/stage-1 for onboarding)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireOnboarding = false,
  redirectTo,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated
  if (requireAuth && !user) {
    const redirectPath = redirectTo || '/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If user is authenticated but trying to access auth pages, redirect to dashboard
  if (!requireAuth && user && (location.pathname.includes('/login') || location.pathname.includes('/register'))) {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  // TODO: Add onboarding status check when onboarding flow is implemented
  // if (requireOnboarding && user && !user.onboardingCompleted) {
  //   return <Navigate to="/vendor/onboarding/stage-1" replace />;
  // }

  return <>{children}</>;
};

