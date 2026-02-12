import React, { useState } from 'react';
import { useOnboarding } from '@/features/vendor/context/OnboardingContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/constants/routes';
import { preloadNextOnboardingStage } from '@/utils/preloaders';
import { InputField } from '@/features/common/components/shared/InputField';
import { Button } from '@/features/common/components/shared/Button';
import { StageIndicator } from '@/features/common/components/shared/StageIndicator';

const OnboardingStage2: React.FC = () => {
  const { data, updateData, completeStage, nextStage, previousStage } = useOnboarding();
  const { user, setOnboardingStatus } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Client-side validation
    if (!data.address) newErrors.address = 'Address is required';
    if (!data.city) newErrors.city = 'City is required';
    if (!data.state) newErrors.state = 'State is required';
    if (!data.postalCode) newErrors.postalCode = 'Postal code is required';
    if (data.workingDays.length === 0) newErrors.workingDays = 'Select at least one working day';

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
      console.log('[OnboardingStage2] Starting stage 2 completion for user:', user.id);

      // Step 1: Save stage 2 data to database
      console.log('[OnboardingStage2] Saving data to database...');
      const { error: updateError, data: updateData } = await (supabase
        .from('vendor_profiles' as any)
        .update({
          address: data.address,
          city: data.city,
          state: data.state,
          postal_code: data.postalCode,
          country: data.country || 'IN',
          working_days: data.workingDays,
          operational_hours: data.operationalHours,
          onboarding_status: 'operational_details',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()) as any;

      if (updateError) {
        console.error('[OnboardingStage2] Database update error:', updateError);
        setErrors({ submit: `Failed to save data: ${updateError.message}. Please try again.` });
        setIsLoading(false);
        return;
      }

      console.log('[OnboardingStage2] Data saved successfully:', updateData);
      setOnboardingStatus('operational_details'); // cache so next page doesn't refetch

      // Step 2: Mark stage 2 as complete in context
      console.log('[OnboardingStage2] Marking stage 2 as complete...');
      try {
        await completeStage(2);
        console.log('[OnboardingStage2] Stage 2 marked as complete');
      } catch (completeError: any) {
        console.error('[OnboardingStage2] Error completing stage:', completeError);
        setErrors({ submit: `Failed to update progress: ${completeError.message}. Please try again.` });
        setIsLoading(false);
        return;
      }

      // Step 3: Preload next stage for faster navigation
      console.log('[OnboardingStage2] Preloading stage 3...');
      preloadNextOnboardingStage(2).catch(console.error);

      // Step 4: Wait a brief moment to ensure database update is committed
      console.log('[OnboardingStage2] Waiting for database commit...');
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay

      // Step 5: Force a hard navigation to stage 3 (bypasses React Router state issues)
      console.log('[OnboardingStage2] Navigating to stage 3...');
      // Use window.location for reliable navigation that forces a fresh page load
      window.location.href = ROUTES.VENDOR_ONBOARDING_STAGE_3;
    } catch (err: any) {
      console.error('[OnboardingStage2] Unexpected error:', err);
      setErrors({ 
        submit: err.message || 'An unexpected error occurred. Please try again or refresh the page.' 
      });
      setIsLoading(false);
    }
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleWorkingDay = (day: string) => {
    const updatedDays = data.workingDays.includes(day)
      ? data.workingDays.filter((d) => d !== day)
      : [...data.workingDays, day];
    updateData({ workingDays: updatedDays });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#E8E8E8] px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Operational Details</h1>
          <p className="text-[#7E8C97] mt-1">Step 2 of 3</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <StageIndicator
            currentStage={2}
            totalStages={3}
            stageLabels={['Restaurant', 'Operations', 'Plans']}
          />

          <form onSubmit={handleNext} className="space-y-6">
            {/* Location Information */}
            <div className="bg-[#F5F5F5] rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-[#1C1C1C]">Location Information</h3>

              <InputField
                label="Address"
                placeholder="Street address"
                value={data.address}
                onChange={(e) => updateData({ address: e.target.value })}
                error={errors.address}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="City"
                  placeholder="Your city"
                  value={data.city}
                  onChange={(e) => updateData({ city: e.target.value })}
                  error={errors.city}
                />
                <InputField
                  label="State"
                  placeholder="Your state"
                  value={data.state}
                  onChange={(e) => updateData({ state: e.target.value })}
                  error={errors.state}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Postal Code"
                  placeholder="XXXXX"
                  value={data.postalCode}
                  onChange={(e) => updateData({ postalCode: e.target.value })}
                  error={errors.postalCode}
                />
                <InputField
                  label="Country"
                  placeholder="India"
                  value={data.country || 'India'}
                  onChange={(e) => updateData({ country: e.target.value })}
                />
              </div>
            </div>

            {/* Working Days */}
            <div className="bg-[#F5F5F5] rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-[#1C1C1C]">Working Days</h3>
              <div className="grid grid-cols-2 gap-3">
                {weekDays.map((day) => (
                  <label key={day} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.workingDays.includes(day)}
                      onChange={() => toggleWorkingDay(day)}
                      className="w-4 h-4 rounded accent-[#EF4F5F] cursor-pointer"
                    />
                    <span className="text-[#1C1C1C] font-medium">{day}</span>
                  </label>
                ))}
              </div>
              {errors.workingDays && (
                <p className="text-sm text-[#E83935] mt-1">{errors.workingDays}</p>
              )}
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
                type="button"
                variant="outline"
                size="lg"
                onClick={() => previousStage()}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="flex-1"
              >
                Continue to Plans
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStage2;

