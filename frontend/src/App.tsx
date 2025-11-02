import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import BusinessLandingPage from './pages/BusinessLandingPage';
import VendorAuth from './pages/VendorAuth';
import VendorDashboard from './pages/VendorDashboard';
import OnboardingLayout from './components/onboarding/OnboardingLayout';
import OnboardingStage1 from './pages/vendor/onboarding/stage-1/OnboardingStage1';
import OnboardingStage2 from './pages/vendor/onboarding/stage-2/OnboardingStage2';
import OnboardingStage3 from './pages/vendor/onboarding/stage-3/OnboardingStage3';
import OnboardingCompletion from './pages/vendor/onboarding/completion/OnboardingCompletion';


// Main App Router
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/business" element={<BusinessLandingPage />} />
          {/* Redirect old vendor/auth route to business landing page */}
          <Route path="/vendor/auth" element={<Navigate to="/business" replace />} />
          
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
      </AuthProvider>
    </Router>
  );
}

export default App;