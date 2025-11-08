import React, { useState } from 'react';
import { useOnboarding } from '@/features/vendor/context/OnboardingContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { preloadNextOnboardingStage, preloadDashboard } from '@/utils/preloaders';
import { Button } from '@/features/common/components/shared/Button';
import { StageIndicator } from '@/features/common/components/shared/StageIndicator';

interface PlanOption {
  id: 'free' | 'pro';
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  badge?: string;
}

const PLANS: PlanOption[] = [
  {
    id: 'free',
    name: 'Free Plan',
    price: '₹0',
    period: 'Forever Free',
    description: 'Perfect for getting started',
    features: [
      'Unlimited orders',
      'Basic menu management',
      'Standard support',
      'Real-time order updates',
      'Mobile app access',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 'Coming Soon',
    period: 'Premium Features',
    description: 'Advanced features (Coming Soon)',
    features: [
      'Everything in Free',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access',
    ],
    badge: 'COMING SOON',
  },
];

const OnboardingStage3: React.FC = () => {
  const { data, updateData, completeStage, nextStage, previousStage } = useOnboarding();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSelectPlan = async (planId: 'free' | 'pro') => {
    if (planId === 'pro') {
      setError('Pro plan is coming soon. Please select the Free Plan to continue.');
      return;
    }

    if (!user) {
      setError('User not authenticated. Please log in again.');
      return;
    }

    // Update local state first
    updateData({ selectedPlan: planId });
    setIsLoading(true);
    setError('');

    try {
      console.log('[OnboardingStage3] Starting stage 3 completion for user:', user.id);
      console.log('[OnboardingStage3] Selected plan:', planId);

      // Get current metadata first to preserve existing data
      console.log('[OnboardingStage3] Fetching current profile...');
      const { data: currentProfile, error: fetchError } = await (supabase
        .from('vendor_profiles' as any)
        .select('metadata, onboarding_status')
        .eq('user_id', user.id)
        .single()) as any;

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[OnboardingStage3] Error fetching profile:', fetchError);
        setError(`Failed to load profile: ${fetchError.message}. Please refresh and try again.`);
        setIsLoading(false);
        return;
      }

      const currentMetadata = currentProfile?.metadata || {};
      
      // Save stage 3 data to database
      console.log('[OnboardingStage3] Saving plan selection to database...');
      console.log('[OnboardingStage3] Update payload:', {
        metadata: {
          ...currentMetadata,
          business_category: data.businessCategory,
          selected_plan: planId,
        },
        onboarding_status: 'planning_selected',
      });
      
      const { error: updateError, data: updateResponse } = await (supabase
        .from('vendor_profiles' as any)
        .update({
          metadata: {
            ...currentMetadata,
            business_category: data.businessCategory,
            selected_plan: planId,
          },
          onboarding_status: 'planning_selected', // This marks stage 3 as complete
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()) as any;

      if (updateError) {
        console.error('[OnboardingStage3] ❌ Database update error:', updateError);
        console.error('[OnboardingStage3] Error code:', updateError.code);
        console.error('[OnboardingStage3] Error message:', updateError.message);
        setError(`Failed to save plan selection: ${updateError.message}. Please try again.`);
        setIsLoading(false);
        return;
      }

      if (!updateResponse || updateResponse.length === 0) {
        console.error('[OnboardingStage3] ❌ No data returned from update!');
        setError('Update succeeded but no data returned. Please refresh and try again.');
        setIsLoading(false);
        return;
      }

      console.log('[OnboardingStage3] ✅ Plan selection saved successfully:', updateResponse);
      
      // Verify the update worked
      const savedStatus = updateResponse[0]?.onboarding_status;
      console.log('[OnboardingStage3] Saved status:', savedStatus);
      if (savedStatus !== 'planning_selected') {
        console.error('[OnboardingStage3] ⚠️ Status mismatch! Expected planning_selected, got:', savedStatus);
        setError(`Status update may have failed. Expected 'planning_selected', got '${savedStatus}'. Please try again.`);
        setIsLoading(false);
        return;
      }

      // Verify database update by re-querying
      console.log('[OnboardingStage3] Verifying database update...');
      const { data: verifyData, error: verifyError } = await (supabase
        .from('vendor_profiles' as any)
        .select('onboarding_status, metadata')
        .eq('user_id', user.id)
        .single()) as any;

      if (verifyError) {
        console.error('[OnboardingStage3] Verification query error:', verifyError);
        setError(`Failed to verify update: ${verifyError.message}. Please refresh and try again.`);
        setIsLoading(false);
        return;
      }

      if (verifyData) {
        console.log('[OnboardingStage3] Verification result - Status:', verifyData.onboarding_status);
        console.log('[OnboardingStage3] Verification result - Selected plan:', verifyData.metadata?.selected_plan);
        if (verifyData.onboarding_status === 'planning_selected' && verifyData.metadata?.selected_plan === planId) {
          console.log('[OnboardingStage3] ✅ Status and plan verified! Stage 3 is complete.');
        } else {
          console.error('[OnboardingStage3] ❌ Verification failed!');
          setError(`Verification failed. Status: ${verifyData.onboarding_status}, Plan: ${verifyData.metadata?.selected_plan}. Please try again.`);
          setIsLoading(false);
          return;
        }
      }

      // Preload completion page and dashboard for faster navigation
      console.log('[OnboardingStage3] Preloading completion page and dashboard...');
      preloadNextOnboardingStage(3).catch(console.error);
      preloadDashboard().catch(console.error);

      // Wait for database commit to propagate
      console.log('[OnboardingStage3] Waiting for database commit propagation...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

      // Navigate to completion page (terms & conditions)
      console.log('[OnboardingStage3] ✅ All checks passed! Navigating to completion page...');
      // Use window.location for reliable navigation
      window.location.href = ROUTES.VENDOR_ONBOARDING_COMPLETION;
      
    } catch (err: any) {
      console.error('[OnboardingStage3] Unexpected error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again or refresh the page.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#E8E8E8] px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Choose Your Plan</h1>
          <p className="text-[#7E8C97] mt-1">Step 3 of 3</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <StageIndicator
            currentStage={3}
            totalStages={3}
            stageLabels={['Restaurant', 'Operations', 'Plans']}
          />

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`
                  relative rounded-xl border-2 p-8 transition-all duration-200
                  ${data.selectedPlan === plan.id
                    ? 'border-[#EF4F5F] bg-[#FFF5F5]'
                    : 'border-[#E8E8E8] hover:border-[#EF4F5F]'
                  }
                  ${plan.id === 'pro' ? 'opacity-60' : ''}
                `}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-[#FF7A00] text-white px-3 py-1 rounded-bl-lg text-xs font-bold">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[#1C1C1C]">{plan.name}</h3>
                  <p className="text-[#7E8C97] text-sm mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#1C1C1C]">{plan.price}</span>
                    <span className="text-[#7E8C97]">{plan.period}</span>
                  </div>
                </div>

                <div className="mb-8 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-[#09A000] font-bold">✓</span>
                      <span className="text-[#1C1C1C]">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={data.selectedPlan === plan.id ? 'primary' : 'outline'}
                  size="lg"
                  className="w-full"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={plan.id === 'pro'}
                  isLoading={isLoading && data.selectedPlan === plan.id}
                >
                  {plan.id === 'pro' ? 'Coming Soon' : 'Select Plan'}
                </Button>
              </div>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => previousStage()}
              className="flex-1"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStage3;

