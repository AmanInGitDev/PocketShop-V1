/**
 * Application Routes
 * 
 * Centralized route definitions for the application
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import BusinessLandingPage from '../pages/BusinessLandingPage';
import AboutUs from '../pages/AboutUs';
import LoginPage from '@/features/auth/pages/LoginPage';
import OnboardingLayout from '@/features/vendor/onboarding/OnboardingLayout';
import OnboardingStage1 from '@/features/vendor/onboarding/stage-1/OnboardingStage1';
import OnboardingStage2 from '@/features/vendor/onboarding/stage-2/OnboardingStage2';
import OnboardingStage3 from '@/features/vendor/onboarding/stage-3/OnboardingStage3';
import OnboardingCompletion from '@/features/vendor/onboarding/completion/OnboardingCompletion';
import VendorDashboard from '@/features/vendor/pages/VendorDashboard';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/business" element={<BusinessLandingPage />} />
      <Route path="/about-us" element={<AboutUs />} />
      
      {/* Vendor authentication routes */}
      <Route path="/login" element={<LoginPage mode="login" />} />
      <Route path="/register" element={<LoginPage mode="register" />} />
      {/* Redirect old vendor/auth route to login */}
      <Route path="/vendor/auth" element={<Navigate to="/login" replace />} />
      
      {/* Onboarding routes - wrapped with OnboardingLayout for shared context */}
      <Route
        path="/vendor/onboarding/stage-1"
        element={
          <OnboardingLayout>
            <OnboardingStage1 />
          </OnboardingLayout>
        }
      />
      <Route
        path="/vendor/onboarding/stage-2"
        element={
          <OnboardingLayout>
            <OnboardingStage2 />
          </OnboardingLayout>
        }
      />
      <Route
        path="/vendor/onboarding/stage-3"
        element={
          <OnboardingLayout>
            <OnboardingStage3 />
          </OnboardingLayout>
        }
      />
      <Route
        path="/vendor/onboarding/completion"
        element={
          <OnboardingLayout>
            <OnboardingCompletion />
          </OnboardingLayout>
        }
      />
      
      {/* Legacy route - redirects to stage-1 */}
      <Route path="/vendor/onboarding" element={<Navigate to="/vendor/onboarding/stage-1" replace />} />
      
      <Route path="/vendor/dashboard/*" element={<VendorDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

