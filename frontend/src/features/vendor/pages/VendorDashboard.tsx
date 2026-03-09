/**
 * Vendor Dashboard Page
 * 
 * Main dashboard route that handles sub-routes for different sections.
 * Sub-routes are lazy loaded for better performance and code splitting.
 */

import React, { useEffect, useMemo, useState, Suspense, lazy } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useVendor } from '@/features/vendor/hooks/useVendor';
import { Loader2 } from 'lucide-react';
import DashboardLayout from '@/app/layouts/DashboardLayout';
import { LoadingFallback } from '@/features/common/components';
import { ROUTES } from '@/constants/routes';
import { supabase } from '@/lib/supabaseClient';
import { OrderProvider } from '@/context/OrderProvider';
import { SupabaseOrderRepository } from '@/features/vendor/services/supabaseOrderRepository';

// Lazy load dashboard sub-routes for code splitting
const DashboardOverview = lazy(() => import('./Dashboard'));
const Orders = lazy(() => import('./Orders'));
const Inventory = lazy(() => import('./Inventory'));
const AddProduct = lazy(() => import('./AddProduct'));
const EditProduct = lazy(() => import('./EditProduct'));
const Insights = lazy(() => import('./Analytics'));
const Storefront = lazy(() => import('./Storefront'));
const Payouts = lazy(() => import('./Payouts'));
const Settings = lazy(() => import('./Settings'));
const Kitchen = lazy(() => import('./Kitchen'));
const OrderDetail = lazy(() => import('./OrderDetail'));

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, onboardingStatus } = useAuth();
  const { data: vendor, isLoading: vendorLoading } = useVendor();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const orderRepo = useMemo(() => new SupabaseOrderRepository(), []);

  // Redirect to auth if not authenticated, or to onboarding if incomplete. Use cached onboarding status when available.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }

    // Use cached status from auth (set once after login) – no DB call
    if (onboardingStatus === 'completed') {
      setCheckingOnboarding(false);
      return;
    }
    if (onboardingStatus !== null) {
      // Cached status exists but not completed – redirect to onboarding
      navigate(ROUTES.VENDOR_ONBOARDING_STAGE_1);
      return;
    }

    // No cache: fetch once (e.g. first load before profile loaded)
    let mounted = true;
    supabase
      .from('vendor_profiles')
      .select('onboarding_status')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error || !data || data.onboarding_status !== 'completed') {
          navigate(ROUTES.VENDOR_ONBOARDING_STAGE_1);
        } else {
          setCheckingOnboarding(false);
        }
      })
      .catch(() => {
        if (mounted) navigate(ROUTES.VENDOR_ONBOARDING_STAGE_1);
      });
    return () => { mounted = false; };
  }, [user, loading, onboardingStatus, navigate]);

  // Show loading while checking auth, onboarding, or vendor profile
  if (loading || checkingOnboarding || vendorLoading) {
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

  // Must have a valid vendor profile – never use 'vendor-demo' for real API calls (causes 400s)
  if (!vendor?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-gray-600 mb-4">Vendor profile not found. Please complete onboarding.</p>
          <button
            onClick={() => navigate(ROUTES.VENDOR_ONBOARDING_STAGE_1)}
            className="text-blue-600 hover:underline font-medium"
          >
            Go to onboarding
          </button>
        </div>
      </div>
    );
  }

  // Orders are stored by vendor_profiles.id (not auth user id). Use Supabase repo for real orders.
  const vendorId = vendor.id;

  return (
    <DashboardLayout>
      <OrderProvider vendorId={vendorId} repo={orderRepo}>
        <Suspense fallback={<LoadingFallback variant="dashboard" />}>
          <Routes>
            <Route path="" element={<DashboardOverview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/add" element={<AddProduct />} />
            <Route path="inventory/edit/:id" element={<EditProduct />} />
            <Route path="insights" element={<Insights />} />
            <Route path="storefront" element={<Storefront />} />
            <Route path="payouts" element={<Payouts />} />
            <Route path="kitchen" element={<Kitchen />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </OrderProvider>
    </DashboardLayout>
  );
};

export default VendorDashboard;

