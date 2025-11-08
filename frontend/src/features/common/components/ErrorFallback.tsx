/**
 * Error Fallback Component
 * 
 * Displays a user-friendly error UI when ErrorBoundary catches an error.
 * Provides options to retry, go home, or view error details (dev only).
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';
import logoImage from '@/assets/images/logo.png';

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo?: React.ErrorInfo | null;
  resetErrorBoundary?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetErrorBoundary,
}) => {
  const navigate = useNavigate();
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleTryAgain = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      // Fallback: reload the page
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
    // Reset error boundary after navigation
    if (resetErrorBoundary) {
      setTimeout(() => resetErrorBoundary(), 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src={logoImage} 
            alt="PocketShop Logo" 
            className="h-12 w-12 object-contain"
          />
        </div>

        {/* Error Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h2>
        
        {/* Description */}
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Don't worry, your data is safe.
          You can try again or return to the homepage.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={handleTryAgain}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </button>
        </div>

        {/* Error Details (Development Only) */}
        {isDevelopment && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2">
              Technical Details (Development Only)
            </summary>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-mono text-red-600 break-all mb-2">
                <strong>Error:</strong> {error.toString()}
              </p>
              {/* Security: Only show stack traces in development */}
              {process.env.NODE_ENV === 'development' && error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-gray-600 mb-1">
                    Stack Trace
                  </summary>
                  <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-40 p-2 bg-gray-100 rounded">
                    {error.stack}
                  </pre>
                </details>
              )}
              {/* Security: Only show component stack in development */}
              {process.env.NODE_ENV === 'development' && errorInfo && errorInfo.componentStack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-gray-600 mb-1">
                    Component Stack
                  </summary>
                  <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-40 p-2 bg-gray-100 rounded">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </details>
        )}

        {/* Support Message */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            If this problem persists, please contact support with details about what you were doing when this error occurred.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;

