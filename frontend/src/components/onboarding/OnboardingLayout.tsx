import React from 'react';
import { OnboardingProvider } from '../../contexts/OnboardingContext';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

/**
 * OnboardingLayout Component
 * 
 * Wraps onboarding pages with OnboardingProvider context.
 * This ensures all onboarding stages share the same state.
 */
const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children }) => {
  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  );
};

export default OnboardingLayout;

