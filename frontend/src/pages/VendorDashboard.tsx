/**
 * Vendor Dashboard Page
 * 
 * This is the main dashboard for vendors after they log in.
 * Placeholder page for now - will be fully implemented later.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Store, LogOut, Loader2 } from 'lucide-react';

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/vendor/auth');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/vendor/auth');
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Store className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">PocketShop</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.full_name || 'Vendor'}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Vendor Dashboard</h1>
          <p className="text-gray-600 mb-8">
            Welcome to your PocketShop vendor dashboard. This is a placeholder page.
            The full dashboard functionality will be implemented soon.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders</h3>
              <p className="text-gray-600 text-sm">Manage your orders</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Products</h3>
              <p className="text-gray-600 text-sm">Manage your products</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">View your analytics</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;

