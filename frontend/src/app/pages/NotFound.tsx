/**
 * NotFound Page (404)
 * 
 * Displays a user-friendly 404 page with context-aware navigation options.
 * Shows different CTAs based on authentication status and user role.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { Home, LogIn, LayoutDashboard, ArrowLeft } from 'lucide-react';
import logoImage from '@/assets/images/logo.png';

const NotFound: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate(ROUTES.HOME, { replace: true });
  };

  const handleGoToDashboard = () => {
    navigate(ROUTES.VENDOR_DASHBOARD, { replace: true });
  };

  const handleGoToLogin = () => {
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src={logoImage} 
            alt="PocketShop Logo" 
            className="h-16 w-16 object-contain"
          />
        </div>

        {/* 404 Illustration */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
            <svg
              className="w-12 h-12 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        {/* Description */}
        <p className="text-lg text-gray-600 mb-2">
          Oops! The page you're looking for doesn't exist.
        </p>
        
        {/* Context-aware message */}
        {user ? (
          <>
            <p className="text-sm text-gray-500 mb-8">
              You're logged in as a vendor. The page may have been moved or deleted.
            </p>
            
            {/* Action buttons for authenticated users */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleGoToDashboard}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Go to Dashboard
              </button>
              <button
                onClick={handleGoHome}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Home
              </button>
              <button
                onClick={handleGoBack}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-8">
              If you were trying to access a vendor menu, try scanning the QR code again.
              Or, if you're a vendor, please log in to access your dashboard.
            </p>
            
            {/* Action buttons for unauthenticated users */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleGoHome}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Home
              </button>
              <button
                onClick={handleGoToLogin}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Vendor Login
              </button>
              <button
                onClick={handleGoBack}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </button>
            </div>
          </>
        )}

        {/* Support message */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            If you believe this is a bug, please contact support with the URL you tried to access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

