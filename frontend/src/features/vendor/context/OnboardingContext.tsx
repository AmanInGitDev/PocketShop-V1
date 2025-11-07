import React, { createContext, useState, useContext } from 'react';

interface OnboardingData {
  // Stage 1: Restaurant Info
  restaurantName: string;
  ownerName: string;
  restaurantType: string;
  businessCategory: string;
  // Stage 2: Operational Details
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  operationalHours: Record<string, { open: string; close: string }>;
  workingDays: string[];
  // Stage 3: Plans
  selectedPlan: 'free' | 'pro' | null;
}

interface OnboardingContextType {
  data: OnboardingData;
  currentStage: number;
  updateData: (newData: Partial<OnboardingData>) => void;
  nextStage: () => void;
  previousStage: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    restaurantName: '',
    ownerName: '',
    restaurantType: '',
    businessCategory: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    operationalHours: {},
    workingDays: [],
    selectedPlan: null,
  });

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const nextStage = () => {
    setCurrentStage((prev) => Math.min(prev + 1, 4));
  };

  const previousStage = () => {
    setCurrentStage((prev) => Math.max(prev - 1, 1));
  };

  const resetOnboarding = () => {
    setCurrentStage(1);
    setData({
      restaurantName: '',
      ownerName: '',
      restaurantType: '',
      businessCategory: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      operationalHours: {},
      workingDays: [],
      selectedPlan: null,
    });
  };

  return (
    <OnboardingContext.Provider value={{ data, currentStage, updateData, nextStage, previousStage, resetOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

