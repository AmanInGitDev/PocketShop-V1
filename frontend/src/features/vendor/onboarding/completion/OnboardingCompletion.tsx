import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/features/vendor/context/OnboardingContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/features/common/components/shared/Button';

const OnboardingCompletion: React.FC = () => {
  const navigate = useNavigate();
  const { data, resetOnboarding, updateData } = useOnboarding();
  const { user, setOnboardingStatus } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(false);
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

    if (!termsAccepted) {
      setError('You must accept the terms and conditions to complete onboarding.');
      return;
    }

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#E8E8E8] px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Complete Registration</h1>
          <p className="text-[#7E8C97] mt-1">Final step - Review & Accept Terms</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Summary */}
          <div className="bg-[#F5F5F5] rounded-lg p-6 mb-8 space-y-4">
            <h3 className="text-lg font-bold text-[#1C1C1C]">Onboarding Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#7E8C97]">Restaurant Name</span>
                <span className="font-medium text-[#1C1C1C]">
                  {(profileData?.business_name || data.restaurantName) || 'Not provided'}
                </span>
              </div>
              <div className="border-t border-[#E8E8E8]" />
              <div className="flex justify-between">
                <span className="text-[#7E8C97]">Owner Name</span>
                <span className="font-medium text-[#1C1C1C]">
                  {(profileData?.owner_name || data.ownerName) || 'Not provided'}
                </span>
              </div>
              <div className="border-t border-[#E8E8E8]" />
              <div className="flex justify-between">
                <span className="text-[#7E8C97]">Location</span>
                <span className="font-medium text-[#1C1C1C]">
                  {((profileData?.city || data.city) && (profileData?.state || data.state)) 
                    ? `${profileData?.city || data.city}, ${profileData?.state || data.state}` 
                    : 'Not provided'}
                </span>
              </div>
              <div className="border-t border-[#E8E8E8]" />
              <div className="flex justify-between">
                <span className="text-[#7E8C97]">Working Days</span>
                <span className="font-medium text-[#1C1C1C]">
                  {((profileData?.working_days || data.workingDays)?.length > 0) 
                    ? `${(profileData?.working_days || data.workingDays).length} days selected` 
                    : 'Not provided'}
                </span>
              </div>
              <div className="border-t border-[#E8E8E8]" />
              <div className="flex justify-between">
                <span className="text-[#7E8C97]">Plan</span>
                <span className="font-medium text-[#1C1C1C]">
                  {(profileData?.metadata?.selected_plan || data.selectedPlan) 
                    ? ((profileData?.metadata?.selected_plan || data.selectedPlan) === 'free' ? 'Free Plan' : 'Pro Plan') 
                    : 'Not selected'}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <form onSubmit={handleCompleteOnboarding} className="space-y-6">
            <div className="bg-white border-2 border-[#E8E8E8] rounded-lg p-6">
              <h4 className="font-bold text-[#1C1C1C] mb-4">Terms & Conditions</h4>
              <div className="bg-[#F5F5F5] rounded p-4 h-48 overflow-y-auto mb-4 text-sm text-[#7E8C97]">
                <p className="mb-3">
                  By registering with PocketShop, you agree to our Terms of Service and Privacy
                  Policy. You confirm that all information provided is accurate and truthful.
                </p>
                <p className="mb-3">
                  You agree to maintain the security of your account and are responsible for all
                  activities under your account. PocketShop reserves the right to suspend or
                  terminate accounts that violate our policies.
                </p>
                <p className="mb-3">
                  You grant PocketShop permission to display your business information, menu items,
                  and other content you provide through the platform. You are responsible for
                  ensuring you have all necessary rights and permissions for any content you upload.
                </p>
                <p>
                  By continuing, you acknowledge that you have read, understood, and agree to be
                  bound by these Terms & Conditions.
                </p>
              </div>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#EF4F5F] cursor-pointer"
                />
                <span className="text-[#1C1C1C] font-medium">
                  I accept the Terms & Conditions
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-[#E8352F] bg-opacity-10 border border-[#E83935] rounded-lg p-3">
                <p className="text-[#E83935] text-sm font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={!termsAccepted || isLoading}
              className="w-full"
            >
              {isLoading ? 'Completing Onboarding...' : 'Complete Onboarding & Go to Dashboard'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCompletion;

