/**
 * Route Skeleton Component
 * 
 * Provides a skeleton loading state for route transitions.
 * Used in Suspense fallbacks for better UX during lazy loading.
 */

import React from 'react';

interface RouteSkeletonProps {
  variant?: 'default' | 'dashboard' | 'onboarding';
}

export const RouteSkeleton: React.FC<RouteSkeletonProps> = ({ variant = 'default' }) => {
  if (variant === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        {/* Header skeleton */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        
        {/* Stats cards skeleton */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
          
          {/* Content skeleton */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'onboarding') {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Progress bar skeleton */}
          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded-full"></div>
          </div>
          
          {/* Form skeleton */}
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default RouteSkeleton;

