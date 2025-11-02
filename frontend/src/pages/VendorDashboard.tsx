/**
 * Vendor Dashboard Page
 * 
 * Main dashboard route that handles sub-routes for different sections.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import DashboardOverview from './DashboardOverview';
import Orders from './Orders';
import Inventory from './Inventory';
import Insights from './Insights';
import Payouts from './Payouts';
import Settings from './Settings';
import { getOnboardingRedirectPath } from '../utils/onboardingCheck';
import { supabase } from '../services/supabase';

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Redirect to auth if not authenticated, or to onboarding if incomplete
  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      if (!loading && !user) {
        navigate('/vendor/auth');
        return;
      }

      if (!loading && user) {
        // Check onboarding status
        try {
          const { data: vendorProfile, error } = await supabase
            .from('vendor_profiles')
            .select('onboarding_status')
            .eq('user_id', user.id)
            .single();

          if (error || !vendorProfile) {
            // No profile or error - redirect to onboarding
            navigate('/vendor/onboarding/stage-1');
            return;
          }

          if (vendorProfile.onboarding_status !== 'completed') {
            // Onboarding incomplete - redirect to stage 1
            navigate('/vendor/onboarding/stage-1');
            return;
          }

          // Onboarding complete - stay on dashboard
          setCheckingOnboarding(false);
        } catch (err) {
          console.error('Error checking onboarding:', err);
          navigate('/vendor/onboarding/stage-1');
        }
      }
    };

    checkAuthAndOnboarding();
  }, [user, loading, navigate]);

  // Show loading while checking auth or onboarding
  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect via useEffect)
  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="" element={<DashboardOverview />} />
        <Route path="orders" element={<Orders />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="insights" element={<Insights />} />
        <Route path="payouts" element={<Payouts />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default VendorDashboard;

