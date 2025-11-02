import { supabase } from '../services/supabase';

/**
 * Check onboarding status for the current user
 * Returns the redirect path based on onboarding status
 */
export const getOnboardingRedirectPath = async (userId: string): Promise<string> => {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<string>((resolve) => 
      setTimeout(() => resolve('/vendor/onboarding/stage-1'), 5000)
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
          return '/vendor/onboarding/stage-1';
        }

        if (data) {
          const status = data.onboarding_status;
          if (status === 'completed') {
            return '/vendor/dashboard';
          } else {
            // Incomplete onboarding - redirect to stage 1
            return '/vendor/onboarding/stage-1';
          }
        }

        // Default to onboarding if no profile found
        return '/vendor/onboarding/stage-1';
      });

    // Race between query and timeout
    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (err) {
    console.error('Error checking onboarding status:', err);
    // Always return a path, never hang
    return '/vendor/onboarding/stage-1';
  }
};

