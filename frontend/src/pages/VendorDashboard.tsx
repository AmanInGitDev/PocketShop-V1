/**
 * Vendor Dashboard Page
 * 
 * Main dashboard route that handles sub-routes for different sections.
 */

import React, { useEffect } from 'react';
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

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/vendor/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
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

