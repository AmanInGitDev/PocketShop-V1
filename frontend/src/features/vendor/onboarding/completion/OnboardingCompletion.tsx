import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/features/vendor/context/OnboardingContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/constants/routes';
import { StageIndicator } from '@/features/common/components/shared/StageIndicator';

const OnboardingCompletion: React.FC = () => {
  const navigate = useNavigate();
  const { data, resetOnboarding, updateData } = useOnboarding();
  const { user, setOnboardingStatus } = useAuth();
  const [subscribeUpdates, setSubscribeUpdates] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  // Load data from database on mount in case context doesn't have it
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        setLoadingData(false);
        return;
      }

      try {
        console.log('[OnboardingCompletion] Loading profile data from database...');
        const { data: profile, error: profileError } = await (supabase
          .from('vendor_profiles' as any)
          .select('*')
          .eq('user_id', user.id)
          .single()) as any;

        if (profileError) {
          console.error('[OnboardingCompletion] Error loading profile:', profileError);
          setLoadingData(false);
          return;
        }

        if (profile) {
          console.log('[OnboardingCompletion] Profile loaded:', profile);
          console.log('[OnboardingCompletion] Onboarding status:', profile.onboarding_status);
          console.log('[OnboardingCompletion] Selected plan:', profile.metadata?.selected_plan);
          
          // Store profile data for display
          setProfileData(profile);
          
          // Update context with profile data if context is missing it
          if (!data.selectedPlan && profile.metadata?.selected_plan) {
            updateData({ selectedPlan: profile.metadata.selected_plan });
          }
          
          // Check if onboarding is already completed
          if (profile.onboarding_status === 'completed') {
            console.log('[OnboardingCompletion] Onboarding already completed, redirecting to dashboard...');
            window.location.href = ROUTES.VENDOR_DASHBOARD;
            return;
          }
        }
      } catch (err) {
        console.error('[OnboardingCompletion] Error loading profile:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadProfileData();
  }, [user, data.selectedPlan, updateData]);

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError('');

    try {
      console.log('[OnboardingCompletion] Starting onboarding completion...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('[OnboardingCompletion] User not authenticated:', userError);
        throw new Error('User not authenticated. Please log in again.');
      }

      console.log('[OnboardingCompletion] User authenticated:', user.id);

      // Use profile data loaded in useEffect, or fetch if not available
      let existingProfile = profileData;
      
      if (!existingProfile) {
        console.log('[OnboardingCompletion] Fetching existing profile...');
        const { data: fetchedProfile, error: fetchError } = await (supabase
          .from('vendor_profiles' as any)
          .select('*')
          .eq('user_id', user.id)
          .single()) as any;

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('[OnboardingCompletion] Error fetching profile:', fetchError);
          throw new Error(`Failed to load profile: ${fetchError.message}`);
        }
        
        existingProfile = fetchedProfile;
      }

      console.log('[OnboardingCompletion] Existing profile:', existingProfile);
      
      // Use profile data if context data is missing
      const finalData = {
        restaurantName: data.restaurantName || existingProfile?.business_name || '',
        ownerName: data.ownerName || existingProfile?.owner_name || '',
        restaurantType: data.restaurantType || existingProfile?.business_type || '',
        businessCategory: data.businessCategory || existingProfile?.metadata?.business_category || '',
        address: data.address || existingProfile?.address || '',
        city: data.city || existingProfile?.city || '',
        state: data.state || existingProfile?.state || '',
        postalCode: data.postalCode || existingProfile?.postal_code || '',
        country: data.country || existingProfile?.country || 'IN',
        workingDays: data.workingDays || existingProfile?.working_days || [],
        operationalHours: data.operationalHours || existingProfile?.operational_hours || {},
        selectedPlan: data.selectedPlan || existingProfile?.metadata?.selected_plan || 'free',
      };
      
      console.log('[OnboardingCompletion] Final data to use:', finalData);

      // Get user's phone number from auth metadata or existing profile
      const userPhone = user.phone || user.user_metadata?.phone || existingProfile?.mobile_number || '';
      
      if (!userPhone && !existingProfile?.mobile_number) {
        console.warn('[OnboardingCompletion] No mobile number found, using empty string');
      }

      // Prepare update data - only update what's needed
      console.log('[OnboardingCompletion] Preparing final profile update...');
      const updateData: any = {
        onboarding_status: 'completed',
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      // Preserve existing mobile_number if it exists
      if (existingProfile?.mobile_number) {
        updateData.mobile_number = existingProfile.mobile_number;
      } else if (userPhone) {
        updateData.mobile_number = userPhone;
      }

      // Ensure all required fields are set (from final data)
      if (finalData.restaurantName) updateData.business_name = finalData.restaurantName;
      if (finalData.ownerName) updateData.owner_name = finalData.ownerName;
      if (finalData.restaurantType) updateData.business_type = finalData.restaurantType;
      if (finalData.address) updateData.address = finalData.address;
      if (finalData.city) updateData.city = finalData.city;
      if (finalData.state) updateData.state = finalData.state;
      if (finalData.postalCode) updateData.postal_code = finalData.postalCode;
      if (finalData.country) updateData.country = finalData.country;
      if (finalData.workingDays && finalData.workingDays.length > 0) updateData.working_days = finalData.workingDays;
      if (finalData.operationalHours) updateData.operational_hours = finalData.operationalHours;

      // Update metadata with selected plan and business category
      const currentMetadata = existingProfile?.metadata || {};
      updateData.metadata = {
        ...currentMetadata,
        business_category: finalData.businessCategory,
        selected_plan: finalData.selectedPlan,
        weekly_updates_opt_in: subscribeUpdates,
      };

      // Ensure email is set
      if (user.email) {
        updateData.email = user.email;
      }

      console.log('[OnboardingCompletion] Update payload:', updateData);

      // Update vendor profile to mark onboarding as completed
      const { error: updateError, data: updateResponse } = await (supabase
        .from('vendor_profiles' as any)
        .update(updateData)
        .eq('user_id', user.id)
        .select()) as any;

      if (updateError) {
        console.error('[OnboardingCompletion] ❌ Update error:', updateError);
        console.error('[OnboardingCompletion] Error code:', updateError.code);
        console.error('[OnboardingCompletion] Error message:', updateError.message);
        
        // Check if it's a mobile_number conflict
        if (updateError.message?.includes('mobile_number') || updateError.code === '23505') {
          throw new Error('This mobile number is already registered. Please contact support.');
        }
        throw new Error(`Failed to complete onboarding: ${updateError.message}`);
      }

      if (!updateResponse || updateResponse.length === 0) {
        console.error('[OnboardingCompletion] ❌ No data returned from update!');
        throw new Error('Update succeeded but no data returned. Please refresh and try again.');
      }

      console.log('[OnboardingCompletion] ✅ Onboarding completed successfully:', updateResponse);

      // Verify the update
      const savedStatus = updateResponse[0]?.onboarding_status;
      if (savedStatus !== 'completed') {
        console.error('[OnboardingCompletion] ⚠️ Status mismatch! Expected completed, got:', savedStatus);
        throw new Error(`Onboarding completion failed. Status is '${savedStatus}' instead of 'completed'.`);
      }

      console.log('[OnboardingCompletion] ✅ Status verified! Onboarding is complete.');
      setOnboardingStatus('completed'); // cache so dashboard doesn't refetch

      // Wait a moment for database to commit
      await new Promise(resolve => setTimeout(resolve, 500));

      // Reset onboarding context
      resetOnboarding();

      // Navigate to dashboard
      console.log('[OnboardingCompletion] Navigating to dashboard...');
      window.location.href = ROUTES.VENDOR_DASHBOARD;
      
    } catch (err: any) {
      console.error('[OnboardingCompletion] Error:', err);
      setError(err.message || 'Failed to complete onboarding. Please try again.');
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF4F5F] mx-auto mb-4"></div>
          <p className="text-[#7E8C97]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans flex flex-col items-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8 max-w-[600px] w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-[#111827] tracking-tight">
          Setup complete
        </h1>
        <p className="text-[#6B7280] mt-1.5 text-sm">Your PocketShop account is ready.</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[600px]">
        <form onSubmit={handleCompleteOnboarding}>
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xl p-10 space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-[#6B7280]">
                  Nice work! Your vendor account is set up.
                </p>
                <p className="text-xs text-[#9CA3AF]">
                  You can change these preferences anytime from Settings.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#F9FAFB] rounded-xl px-4 py-3 border border-[#E5E7EB]">
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Subscribe to weekly product updates</p>
                    <p className="text-xs text-[#6B7280]">
                      Short email once a week with improvements and tips.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubscribeUpdates((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      subscribeUpdates ? 'bg-[#5522E2]' : 'bg-[#E5E7EB]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        subscribeUpdates ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-sm font-medium text-[#5522E2] hover:text-[#4A1EC9]"
                >
                  Follow us on LinkedIn
                </a>
              </div>

              {error && (
                <div className="bg-[#E8352F] bg-opacity-10 border border-[#E83935] rounded-lg p-3">
                  <p className="text-[#E83935] text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-8 py-3.5 rounded-lg bg-[#5522E2] hover:bg-[#4A1EC9] text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#5522E2]/25 focus:ring-offset-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? 'Taking you to dashboard…' : 'Go to dashboard'}
              </button>
            </div>
          </form>

          {/* Progress dots */}
          <div className="flex justify-center mt-10">
            <StageIndicator currentStage={3} totalStages={3} />
          </div>
      </div>
    </div>
  );
};

export default OnboardingCompletion;

