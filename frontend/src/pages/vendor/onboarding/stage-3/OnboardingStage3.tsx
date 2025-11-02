import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { Button } from '../../../../components/shared/Button';
import { StageIndicator } from '../../../../components/shared/StageIndicator';

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
  const navigate = useNavigate();
  const { data, updateData, nextStage, previousStage } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async (planId: 'free' | 'pro') => {
    if (planId === 'pro') return; // Pro plan not available yet

    updateData({ selectedPlan: planId });
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    nextStage();
    navigate('/vendor/onboarding/completion');
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

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                previousStage();
                navigate('/vendor/onboarding/stage-2');
              }}
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

