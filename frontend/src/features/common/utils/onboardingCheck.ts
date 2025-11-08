import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/constants/routes';

/**
 * Check onboarding status for the current user
 * Returns the redirect path based on onboarding status
 */
export const getOnboardingRedirectPath = async (userId: string): Promise<string> => {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<string>((resolve) => 
      setTimeout(() => resolve(ROUTES.VENDOR_ONBOARDING_STAGE_1), 5000)
    );

    const queryPromise = supabase
      .from('vendor_profiles')
      .select('onboarding_status')
      .eq('user_id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.log('Profile query error:', error.code, error.message);
          // If profile doesn't exist, redirect to onboarding
          return ROUTES.VENDOR_ONBOARDING_STAGE_1;
        }

        if (data) {
          const status = data.onboarding_status;
          console.log('getOnboardingRedirectPath - Status:', status);
          // Check if status is exactly 'completed' (case-sensitive)
          if (status === 'completed') {
            console.log('Redirecting to dashboard - onboarding completed');
            return ROUTES.VENDOR_DASHBOARD;
          } else {
            // Incomplete onboarding - redirect to stage 1
            console.log('Redirecting to onboarding - status:', status);
            return ROUTES.VENDOR_ONBOARDING_STAGE_1;
          }
        }

        // Default to onboarding if no profile found
        return ROUTES.VENDOR_ONBOARDING_STAGE_1;
      });

    // Race between query and timeout
    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (err) {
    console.error('Error checking onboarding status:', err);
    // Always return a path, never hang
    return ROUTES.VENDOR_ONBOARDING_STAGE_1;
  }
};

