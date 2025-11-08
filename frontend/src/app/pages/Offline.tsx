/**
 * Offline Page
 * 
 * Offline fallback page displayed when the user is offline
 * and tries to access a route that requires network connectivity.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

const Offline: React.FC = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate(ROUTES.HOME);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-2">
          It looks like you've lost your connection to the internet.
        </p>
        <p className="text-gray-600 mb-8">
          You can still browse cached pages, but some features may be unavailable.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Retry Connection
          </button>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </button>
        </div>

        {/* Helpful tips */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
          <p className="text-sm text-blue-900 font-medium mb-2">While offline, you can:</p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Browse previously visited pages</li>
            <li>View cached content</li>
            <li>Access offline features (when implemented)</li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default Offline;

