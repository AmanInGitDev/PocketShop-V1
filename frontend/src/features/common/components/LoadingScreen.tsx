/**
 * Loading Screen Component
 * 
 * Displays a loading spinner during initial authentication check.
 * Prevents route rendering until auth state is confirmed.
 */

import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* Loading message */}
        <p className="text-gray-600 text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
