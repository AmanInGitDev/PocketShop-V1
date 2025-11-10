/**
 * Vendor Dashboard Page
 * 
 * Main dashboard route that handles sub-routes for different sections.
 * Sub-routes are lazy loaded for better performance and code splitting.
 */

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Loader2 } from 'lucide-react';
import DashboardLayout from '@/app/layouts/DashboardLayout';
import { LoadingFallback } from '@/features/common/components';
import { ROUTES } from '@/constants/routes';
import { getOnboardingRedirectPath } from '@/features/common/utils/onboardingCheck';
import { supabase } from '@/lib/supabaseClient';
import { OrderProvider } from '@/context/OrderProvider';

// Lazy load dashboard sub-routes for code splitting
const DashboardOverview = lazy(() => import('./DashboardNew'));
const Orders = lazy(() => import('./OrdersNew'));
const Inventory = lazy(() => import('./InventoryNew'));
const AddProduct = lazy(() => import('./AddProductNew'));
const EditProduct = lazy(() => import('./EditProductNew'));
const Insights = lazy(() => import('./AnalyticsNew'));
const Storefront = lazy(() => import('./StorefrontNew'));
const Payouts = lazy(() => import('./PaymentsNew'));
const Settings = lazy(() => import('./SettingsNew'));

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Redirect to auth if not authenticated, or to onboarding if incomplete
  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      if (!loading && !user) {
        navigate(ROUTES.LOGIN);
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

          if (error) {
            console.error('Error fetching vendor profile:', error);
            // If profile doesn't exist (PGRST116), redirect to onboarding where it can be created
            // AuthContext should have created it, but if not, onboarding will handle it
            if (error.code === 'PGRST116') {
              console.log('Vendor profile not found, redirecting to onboarding');
            }
            navigate(ROUTES.VENDOR_ONBOARDING_STAGE_1);
            return;
          }

          if (!vendorProfile) {
            console.log('No vendor profile found, redirecting to onboarding');
            navigate(ROUTES.VENDOR_ONBOARDING_STAGE_1);
            return;
          }

          if (vendorProfile.onboarding_status !== 'completed') {
            // Onboarding incomplete - redirect to stage 1
            console.log('Onboarding incomplete, redirecting to stage-1');
            navigate(ROUTES.VENDOR_ONBOARDING_STAGE_1);
            return;
          }

          // Onboarding complete - stay on dashboard
          console.log('Onboarding complete, staying on dashboard');
          setCheckingOnboarding(false);
        } catch (err) {
          console.error('Error checking onboarding:', err);
          navigate(ROUTES.VENDOR_ONBOARDING_STAGE_1);
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
      <OrderProvider vendorId={user?.id || 'vendor-demo'}>
        <Suspense fallback={<LoadingFallback variant="dashboard" />}>
          <Routes>
            <Route path="" element={<DashboardOverview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/add" element={<AddProduct />} />
            <Route path="inventory/edit/:id" element={<EditProduct />} />
            <Route path="insights" element={<Insights />} />
            <Route path="storefront" element={<Storefront />} />
            <Route path="payouts" element={<Payouts />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </OrderProvider>
    </DashboardLayout>
  );
};

export default VendorDashboard;

