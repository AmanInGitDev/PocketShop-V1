import React, { useState } from 'react';
import { useOnboarding } from '@/features/vendor/context/OnboardingContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/constants/routes';
import { preloadNextOnboardingStage } from '@/utils/preloaders';
import { InputField } from '@/features/common/components/shared/InputField';
import { Button } from '@/features/common/components/shared/Button';
import { StageIndicator } from '@/features/common/components/shared/StageIndicator';

const OnboardingStage1: React.FC = () => {
  const { data, updateData, completeStage, nextStage } = useOnboarding();
  const { user } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Client-side validation
    if (!data.restaurantName) newErrors.restaurantName = 'Restaurant name is required';
    if (!data.ownerName) newErrors.ownerName = 'Owner name is required';
    if (!data.restaurantType) newErrors.restaurantType = 'Restaurant type is required';
    if (!data.businessCategory) newErrors.businessCategory = 'Business category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!user) {
      setErrors({ submit: 'User not authenticated. Please log in again.' });
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      console.log('[OnboardingStage1] Starting stage 1 completion for user:', user.id);
      console.log('[OnboardingStage1] Form data:', {
        restaurantName: data.restaurantName,
        ownerName: data.ownerName,
        restaurantType: data.restaurantType,
        businessCategory: data.businessCategory,
      });

      // Step 0: Check if vendor profile exists
      console.log('[OnboardingStage1] Checking if vendor profile exists...');
      const { data: existingProfile, error: checkError } = await (supabase
        .from('vendor_profiles' as any)
        .select('id, onboarding_status')
        .eq('user_id', user.id)
        .single()) as any;

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means "not found" which is OK, we'll create/update
        console.error('[OnboardingStage1] Error checking profile:', checkError);
        setErrors({ submit: `Error checking profile: ${checkError.message}. Please refresh and try again.` });
        setIsLoading(false);
        return;
      }

      let updateResponse: any = null;
      
      if (!existingProfile) {
        console.log('[OnboardingStage1] No profile found, creating new profile...');
        // Profile doesn't exist, create it
        const { error: createError, data: createResponse } = await (supabase
          .from('vendor_profiles' as any)
          .insert({
            user_id: user.id,
            business_name: data.restaurantName,
            owner_name: data.ownerName,
            business_type: data.restaurantType,
            email: user.email || '',
            mobile_number: '', // Will be set later or from auth metadata
            metadata: {
              business_category: data.businessCategory,
            },
            onboarding_status: 'basic_info',
            is_active: false,
          })
          .select()) as any;

        if (createError) {
          console.error('[OnboardingStage1] ❌ Error creating profile:', createError);
          console.error('[OnboardingStage1] Error code:', createError.code);
          console.error('[OnboardingStage1] Error message:', createError.message);
          console.error('[OnboardingStage1] Error details:', createError.details);
          setErrors({ submit: `Failed to create profile: ${createError.message} (Code: ${createError.code}). Please check if you have permission to create a profile.` });
          setIsLoading(false);
          return;
        }

        console.log('[OnboardingStage1] ✅ Profile created successfully:', createResponse);
        updateResponse = createResponse;
      } else {
        console.log('[OnboardingStage1] Profile exists, updating...');
        console.log('[OnboardingStage1] Current status:', existingProfile.onboarding_status);

        // Step 1: Save stage 1 data AND update onboarding status in one operation
        console.log('[OnboardingStage1] Saving data to database with status update...');
        console.log('[OnboardingStage1] User ID:', user.id);
        console.log('[OnboardingStage1] Update payload:', {
          business_name: data.restaurantName,
          owner_name: data.ownerName,
          business_type: data.restaurantType,
          metadata: {
            business_category: data.businessCategory,
          },
          onboarding_status: 'basic_info',
        });
        
        const { error: updateError, data: updateData } = await (supabase
          .from('vendor_profiles' as any)
          .update({
            business_name: data.restaurantName,
            owner_name: data.ownerName,
            business_type: data.restaurantType,
            metadata: {
              business_category: data.businessCategory,
            },
            onboarding_status: 'basic_info', // This marks stage 1 as complete
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()) as any;
        
        console.log('[OnboardingStage1] Update response - Error:', updateError);
        console.log('[OnboardingStage1] Update response - Data:', updateData);

        if (updateError) {
          console.error('[OnboardingStage1] ❌ Database update error:', updateError);
          console.error('[OnboardingStage1] Error code:', updateError.code);
          console.error('[OnboardingStage1] Error message:', updateError.message);
          console.error('[OnboardingStage1] Error details:', updateError.details);
          setErrors({ submit: `Failed to save data: ${updateError.message} (Code: ${updateError.code}). Please check if you have permission to update your profile.` });
          setIsLoading(false);
          return;
        }

        if (!updateData || updateData.length === 0) {
          console.error('[OnboardingStage1] ❌ No data returned from update!');
          setErrors({ submit: 'Update succeeded but no data returned. Please refresh and try again.' });
          setIsLoading(false);
          return;
        }

        updateResponse = updateData;
      }

      console.log('[OnboardingStage1] ✅ Data saved successfully:', updateResponse);
      
      // Verify the update actually worked by checking the returned data
      const savedStatus = updateResponse[0]?.onboarding_status;
      console.log('[OnboardingStage1] Saved status from response:', savedStatus);
      if (savedStatus !== 'basic_info') {
        console.error('[OnboardingStage1] ⚠️ WARNING: Status mismatch! Expected basic_info, got:', savedStatus);
        setErrors({ submit: `Status update may have failed. Expected 'basic_info', got '${savedStatus}'. Please try again.` });
        setIsLoading(false);
        return;
      }

      // Step 2: Verify database update by re-querying (double-check)
      console.log('[OnboardingStage1] Verifying database update...');
      const { data: verifyData, error: verifyError } = await (supabase
        .from('vendor_profiles' as any)
        .select('onboarding_status, business_name')
        .eq('user_id', user.id)
        .single()) as any;

      if (verifyError) {
        console.error('[OnboardingStage1] Verification query error:', verifyError);
        setErrors({ submit: `Failed to verify update: ${verifyError.message}. Please refresh and try again.` });
        setIsLoading(false);
        return;
      }

      if (verifyData) {
        console.log('[OnboardingStage1] Verification result - Status:', verifyData.onboarding_status);
        if (verifyData.onboarding_status === 'basic_info') {
          console.log('[OnboardingStage1] ✅ Status verified! Stage 1 is complete.');
        } else {
          console.error('[OnboardingStage1] ❌ Status verification failed! Status is:', verifyData.onboarding_status);
          setErrors({ submit: `Status update failed. Current status: ${verifyData.onboarding_status}. Please try again.` });
          setIsLoading(false);
          return;
        }
      }

      // Step 3: Preload next stage for faster navigation
      console.log('[OnboardingStage1] Preloading stage 2...');
      preloadNextOnboardingStage(1).catch(console.error);

      // Step 4: Wait a moment to ensure database commit is fully propagated
      console.log('[OnboardingStage1] Waiting for database commit propagation...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Increased to 1s for reliability

      // Step 5: Force a hard navigation to stage 2 (bypasses React Router state issues)
      console.log('[OnboardingStage1] ✅ All checks passed! Navigating to stage 2...');
      // Use window.location for reliable navigation that forces a fresh page load
      // This ensures OnboardingProtectedRoute re-checks the database with fresh data
      window.location.href = ROUTES.VENDOR_ONBOARDING_STAGE_2;
      
    } catch (err: any) {
      console.error('[OnboardingStage1] Unexpected error:', err);
      setErrors({ 
        submit: err.message || 'An unexpected error occurred. Please try again or refresh the page.' 
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#E8E8E8] px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Complete Your Profile</h1>
          <p className="text-[#7E8C97] mt-1">Step 1 of 3</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <StageIndicator
            currentStage={1}
            totalStages={3}
            stageLabels={['Restaurant', 'Operations', 'Plans']}
          />

          <form onSubmit={handleNext} className="space-y-6">
            <div className="bg-[#F5F5F5] rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-bold text-[#1C1C1C]">Restaurant Information</h3>

              <InputField
                label="Restaurant Name"
                placeholder="e.g., Golden Dragon Restaurant"
                value={data.restaurantName}
                onChange={(e) => updateData({ restaurantName: e.target.value })}
                error={errors.restaurantName}
              />

              <InputField
                label="Owner Name"
                placeholder="Your full name"
                value={data.ownerName}
                onChange={(e) => updateData({ ownerName: e.target.value })}
                error={errors.ownerName}
              />

              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                  Restaurant Type
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-[#E8E8E8] rounded-lg font-medium focus:border-[#EF4F5F] focus:ring-2 focus:ring-[#EF4F5F] focus:outline-none transition-all"
                  value={data.restaurantType}
                  onChange={(e) => updateData({ restaurantType: e.target.value })}
                >
                  <option value="">Select restaurant type</option>
                  <option value="food-truck">Food Truck</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="cloud-kitchen">Cloud Kitchen</option>
                </select>
                {errors.restaurantType && (
                  <p className="text-sm text-[#E83935] mt-1">{errors.restaurantType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                  Business Category
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-[#E8E8E8] rounded-lg font-medium focus:border-[#EF4F5F] focus:ring-2 focus:ring-[#EF4F5F] focus:outline-none transition-all"
                  value={data.businessCategory}
                  onChange={(e) => updateData({ businessCategory: e.target.value })}
                >
                  <option value="">Select category</option>
                  <option value="chinese">Chinese</option>
                  <option value="indian">Indian</option>
                  <option value="italian">Italian</option>
                  <option value="fast-food">Fast Food</option>
                  <option value="bakery">Bakery</option>
                  <option value="cafe">Cafe</option>
                  <option value="desserts">Desserts</option>
                </select>
                {errors.businessCategory && (
                  <p className="text-sm text-[#E83935] mt-1">{errors.businessCategory}</p>
                )}
              </div>
            </div>

            {/* Error message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="flex-1"
              >
                Continue to Operations
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStage1;

