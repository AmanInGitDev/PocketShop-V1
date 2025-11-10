/**
 * Route Constants
 * 
 * Centralized route path definitions for the application.
 * Use these constants instead of hardcoded strings for better maintainability and type safety.
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  BUSINESS: '/business',
  ABOUT: '/about-us',
  
  // Authentication routes
  LOGIN: '/login',
  REGISTER: '/register',
  VENDOR_AUTH: '/vendor/auth', // Legacy route, redirects to LOGIN
  
  // Onboarding routes
  VENDOR_ONBOARDING: '/vendor/onboarding',
  VENDOR_ONBOARDING_STAGE_1: '/vendor/onboarding/stage-1',
  VENDOR_ONBOARDING_STAGE_2: '/vendor/onboarding/stage-2',
  VENDOR_ONBOARDING_STAGE_3: '/vendor/onboarding/stage-3',
  VENDOR_ONBOARDING_COMPLETION: '/vendor/onboarding/completion',
  
  // Dashboard routes
  VENDOR_DASHBOARD: '/vendor/dashboard',
  VENDOR_DASHBOARD_OVERVIEW: '/vendor/dashboard',
  VENDOR_DASHBOARD_ORDERS: '/vendor/dashboard/orders',
  VENDOR_DASHBOARD_INVENTORY: '/vendor/dashboard/inventory',
  VENDOR_DASHBOARD_INSIGHTS: '/vendor/dashboard/insights',
  VENDOR_DASHBOARD_STOREFRONT: '/vendor/dashboard/storefront',
  VENDOR_DASHBOARD_PAYOUTS: '/vendor/dashboard/payouts',
  VENDOR_DASHBOARD_SETTINGS: '/vendor/dashboard/settings',
  
  // Public storefront route
  PUBLIC_STOREFRONT: '/storefront/:vendorId',
  
  // PWA routes
  OFFLINE: '/offline',
  
  // 404 - catch-all
  NOT_FOUND: '*',
} as const;

// Type for route paths
export type RoutePath = typeof ROUTES[keyof typeof ROUTES];

// Helper to get route paths as array (useful for validation)
export const getAllRoutes = (): string[] => {
  return Object.values(ROUTES);
};

// Helper to check if a path is a valid route
export const isValidRoute = (path: string): boolean => {
  return getAllRoutes().includes(path);
};

// Helper to get route name from path (for debugging/logging)
export const getRouteName = (path: string): string | null => {
  const entry = Object.entries(ROUTES).find(([_, value]) => value === path);
  return entry ? entry[0] : null;
};

