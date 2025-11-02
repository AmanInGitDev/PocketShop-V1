import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { supabase } from '../../../../services/supabase';
import { Button } from '../../../../components/shared/Button';

const OnboardingCompletion: React.FC = () => {
  const navigate = useNavigate();
  const { data, resetOnboarding } = useOnboarding();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Get user's phone number from auth metadata or phone field
      const userPhone = user.phone || user.user_metadata?.phone || '';

      // Create vendor profile in Supabase
      const { error: insertError } = await supabase
        .from('vendor_profiles')
        .insert([
          {
            user_id: user.id,
            business_name: data.restaurantName,
            owner_name: data.ownerName,
            business_type: data.restaurantType,
            // Store business_category and selected_plan in metadata JSONB field
            // Note: These fields don't exist in the base schema, using metadata
            address: data.address,
            city: data.city,
            state: data.state,
            postal_code: data.postalCode,
            country: data.country || 'IN',
            working_days: data.workingDays,
            onboarding_status: 'completed',
            is_active: true,
            metadata: {
              business_category: data.businessCategory,
              selected_plan: data.selectedPlan,
            },
            // Email from user or fallback
            email: user.email || user.user_metadata?.email || '',
            // Mobile number from user phone
            mobile_number: userPhone,
          },
        ]);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      // Reset onboarding context
      resetOnboarding();

      // Redirect to dashboard
      navigate('/vendor/dashboard');
    } catch (err: any) {
      console.error('Error creating account:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#E8E8E8] px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Complete Registration</h1>
          <p className="text-[#7E8C97] mt-1">Final step</p>
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
                <span className="font-medium text-[#1C1C1C]">{data.restaurantName}</span>
              </div>
              <div className="border-t border-[#E8E8E8]" />
              <div className="flex justify-between">
                <span className="text-[#7E8C97]">Owner Name</span>
                <span className="font-medium text-[#1C1C1C]">{data.ownerName}</span>
              </div>
              <div className="border-t border-[#E8E8E8]" />
              <div className="flex justify-between">
                <span className="text-[#7E8C97]">Location</span>
                <span className="font-medium text-[#1C1C1C]">{data.city}, {data.state}</span>
              </div>
              <div className="border-t border-[#E8E8E8]" />
              <div className="flex justify-between">
                <span className="text-[#7E8C97]">Working Days</span>
                <span className="font-medium text-[#1C1C1C]">{data.workingDays.length} days selected</span>
              </div>
              <div className="border-t border-[#E8E8E8]" />
              <div className="flex justify-between">
                <span className="text-[#7E8C97]">Plan</span>
                <span className="font-medium text-[#1C1C1C]">{data.selectedPlan === 'free' ? 'Free Plan' : 'Pro Plan'}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <form onSubmit={handleCreateAccount} className="space-y-6">
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
              className="w-full"
            >
              Create Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCompletion;

