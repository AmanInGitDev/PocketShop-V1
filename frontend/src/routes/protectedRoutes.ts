/**
 * Protected Routes Configuration
 * 
 * Routes that require authentication and/or completed onboarding.
 */

import { lazy } from 'react';
import { ROUTES } from '@/constants/routes';
import type { RouteConfig } from './types';

// Lazy load dashboard component
const VendorDashboard = lazy(() => import('@/features/vendor/pages/VendorDashboard'));

export const protectedRoutes: RouteConfig[] = [
  {
    path: `${ROUTES.VENDOR_DASHBOARD}/*`, // Use /* for nested routes
    component: VendorDashboard,
    title: 'Dashboard - PocketShop',
    requiresAuth: true,
    requiresOnboarding: true,
    accessLevel: 'vendor',
    loadingVariant: 'dashboard',
    breadcrumbs: [
      { label: 'Home', path: ROUTES.HOME },
      { label: 'Dashboard' },
    ],
    // Note: VendorDashboard handles its own sub-routes internally
    // Sub-routes are defined in VendorDashboard.tsx
  },
];

