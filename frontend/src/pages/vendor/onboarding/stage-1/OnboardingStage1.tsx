import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { InputField } from '../../../../components/shared/InputField';
import { Button } from '../../../../components/shared/Button';
import { StageIndicator } from '../../../../components/shared/StageIndicator';

const OnboardingStage1: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateData, nextStage } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!data.restaurantName) newErrors.restaurantName = 'Restaurant name is required';
    if (!data.ownerName) newErrors.ownerName = 'Owner name is required';
    if (!data.restaurantType) newErrors.restaurantType = 'Restaurant type is required';
    if (!data.businessCategory) newErrors.businessCategory = 'Business category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    nextStage();
    navigate('/vendor/onboarding/stage-2');
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

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate('/register')}
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

