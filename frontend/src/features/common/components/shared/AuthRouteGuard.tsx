/**
 * Auth Route Guard Component
 * 
 * Redirects authenticated users away from auth pages (login/register).
 * Prevents authenticated users from accessing login/register pages.
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { LoadingScreen } from '@/features/common/components/LoadingScreen';
import { getOnboardingRedirectPath } from '@/features/common/utils/onboardingCheck';

interface AuthRouteGuardProps {
  children: React.ReactNode;
}

/**
 * AuthRouteGuard - Redirects authenticated users away from auth pages
 * 
 * Usage:
 * <Route path="/login" element={
 *   <AuthRouteGuard>
 *     <LoginPage />
 *   </AuthRouteGuard>
 * } />
 */
export const AuthRouteGuard: React.FC<AuthRouteGuardProps> = ({ children }) => {
  // CRITICAL: loading MUST be destructured from useAuth()
  const { user, loading, session } = useAuth();
  const location = useLocation();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  // Defensive check: ensure loading is defined
  const safeLoading = typeof loading !== 'undefined' ? loading : true;

  useEffect(() => {
    let mounted = true;

    const checkAndRedirect = async () => {
      // Don't redirect if still loading auth
      if (safeLoading) {
        return;
      }

      // Reset redirect path if user is not authenticated
      if (!user || !session) {
        if (mounted) {
          setRedirectPath(null);
          setCheckingOnboarding(false);
        }
        return;
      }

      // If user is authenticated, determine where to redirect
      setCheckingOnboarding(true);

      try {
        // Get the appropriate redirect path based on onboarding status
        const path = await getOnboardingRedirectPath(user.id);
        
        if (mounted) {
          setRedirectPath(path);
        }
      } catch (err) {
        console.error('[AuthRouteGuard] Error determining redirect path:', err);
        // Default to dashboard on error
        if (mounted) {
          setRedirectPath(ROUTES.VENDOR_DASHBOARD);
        }
      } finally {
        if (mounted) {
          setCheckingOnboarding(false);
        }
      }
    };

    checkAndRedirect();

    return () => {
      mounted = false;
    };
  }, [user, session, safeLoading]);

  // Show loading during auth check
  if (safeLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Show loading while checking onboarding status for authenticated users
  if (user && session && checkingOnboarding) {
    return <LoadingScreen message="Redirecting..." />;
  }

    // If user is authenticated and we have a redirect path, redirect away from auth pages
    if (user && session && redirectPath) {
      // Check if we have a "from" location in state (from ProtectedRoute redirect)
      // If so, redirect there instead (but only if it's a valid protected route)
      const from = (location.state as any)?.from?.pathname;
      const finalRedirectPath = from && from !== ROUTES.LOGIN && from !== ROUTES.REGISTER 
        ? from 
        : redirectPath;

      return <Navigate to={finalRedirectPath} replace />;
    }

  // User is not authenticated, allow access to auth pages
  return <>{children}</>;
};
