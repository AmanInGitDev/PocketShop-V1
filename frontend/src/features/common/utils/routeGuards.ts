import { supabase } from '@/lib/supabaseClient';

/**
 * Route Guard Utilities
 * 
 * Helper functions for route protection logic
 */

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Check if user has completed onboarding
 * This checks the vendor_profiles table for onboarding_status
 */
export const hasCompletedOnboarding = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('onboarding_status')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }

    // Consider onboarding complete if status is 'completed' or if profile exists with required fields
    return data?.onboarding_status === 'completed';
  } catch (error) {
    console.error('Error in hasCompletedOnboarding:', error);
    return false;
  }
};

/**
 * Get current onboarding stage for user
 */
export const getCurrentOnboardingStage = async (userId: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('onboarding_status')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return 1; // Start at stage 1 if no profile exists
    }

    // Map onboarding_status to stage number
    const statusMap: Record<string, number> = {
      'registered': 1,
      'restaurant_info_filled': 2,
      'operational_details_filled': 3,
      'plan_selected': 4,
      'completed': 5,
    };

    return statusMap[data.onboarding_status] || 1;
  } catch (error) {
    console.error('Error getting onboarding stage:', error);
    return 1;
  }
};

/**
 * Check if route requires authentication
 */
export const isAuthRoute = (pathname: string): boolean => {
  return pathname.includes('/login') || 
         pathname.includes('/register') ||
         pathname.includes('/vendor/auth/verify-otp');
};

/**
 * Check if route is onboarding route
 */
export const isOnboardingRoute = (pathname: string): boolean => {
  return pathname.includes('/vendor/onboarding');
};

/**
 * Check if route is dashboard route
 */
export const isDashboardRoute = (pathname: string): boolean => {
  return pathname.includes('/vendor/dashboard');
};

