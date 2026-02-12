/**
 * Public Routes Configuration
 * 
 * Routes that are accessible without authentication.
 */

import { lazy } from 'react';
import { ROUTES } from '@/constants/routes';
import type { RouteConfig } from './types';

// Eagerly loaded components (critical path)
import LandingPage from '@/app/pages/LandingPage';
import BusinessLandingPage from '@/app/pages/BusinessLandingPage';
import AboutUs from '@/app/pages/AboutUs';
import NotFound from '@/app/pages/NotFound';
import Offline from '@/app/pages/Offline';
import LoginPage from '@/features/auth/pages/LoginPage';
import AuthCallbackPage from '@/features/auth/pages/AuthCallbackPage';

// Lazy loaded components
const PublicStorefront = lazy(() => import('@/features/storefront/pages/PublicStorefront'));
const OrderConfirmation = lazy(() => import('@/app/pages/OrderConfirmation'));

export const publicRoutes: RouteConfig[] = [
  {
    path: ROUTES.HOME,
    component: LandingPage,
    title: 'Home - PocketShop',
    accessLevel: 'public',
    eager: true,
    breadcrumbs: [{ label: 'Home' }],
  },
  {
    path: ROUTES.BUSINESS,
    component: BusinessLandingPage,
    title: 'For Business - PocketShop',
    accessLevel: 'public',
    eager: true,
    breadcrumbs: [{ label: 'Home', path: ROUTES.HOME }, { label: 'For Business' }],
  },
  {
    path: ROUTES.ABOUT,
    component: AboutUs,
    title: 'About Us - PocketShop',
    accessLevel: 'public',
    eager: true,
    breadcrumbs: [{ label: 'Home', path: ROUTES.HOME }, { label: 'About Us' }],
  },
  {
    path: ROUTES.LOGIN,
    component: LoginPage,
    title: 'Login - PocketShop',
    accessLevel: 'public',
    requiresAuth: false, // Explicitly public, but redirects if already authenticated
    eager: true,
    props: { mode: 'login' },
    breadcrumbs: [{ label: 'Home', path: ROUTES.HOME }, { label: 'Login' }],
  },
  {
    path: ROUTES.REGISTER,
    component: LoginPage,
    title: 'Register - PocketShop',
    accessLevel: 'public',
    requiresAuth: false, // Explicitly public, but redirects if already authenticated
    eager: true,
    props: { mode: 'register' },
    breadcrumbs: [{ label: 'Home', path: ROUTES.HOME }, { label: 'Register' }],
  },
  {
    path: ROUTES.AUTH_CALLBACK,
    component: AuthCallbackPage,
    title: 'Signing in - PocketShop',
    accessLevel: 'public',
    eager: true,
    breadcrumbs: [{ label: 'Signing in' }],
  },
  {
    path: ROUTES.VENDOR_AUTH,
    redirect: ROUTES.LOGIN,
    title: 'Redirect to Login',
    accessLevel: 'public',
    replace: true,
  },
  {
    path: '/storefront/:vendorId',
    component: PublicStorefront,
    title: 'Storefront - PocketShop',
    accessLevel: 'public',
    loadingVariant: 'full',
    breadcrumbs: [{ label: 'Home', path: ROUTES.HOME }, { label: 'Storefront' }],
  },
  {
    path: '/order-confirmation',
    component: OrderConfirmation,
    title: 'Order Confirmation - PocketShop',
    accessLevel: 'public',
    loadingVariant: 'full',
    breadcrumbs: [{ label: 'Home', path: ROUTES.HOME }, { label: 'Order Confirmation' }],
  },
  {
    path: ROUTES.OFFLINE,
    component: Offline,
    title: 'Offline - PocketShop',
    accessLevel: 'public',
    eager: true,
    breadcrumbs: [{ label: 'Home', path: ROUTES.HOME }, { label: 'Offline' }],
  },
  {
    path: ROUTES.NOT_FOUND,
    component: NotFound,
    title: '404 - Page Not Found',
    accessLevel: 'public',
    eager: true,
    breadcrumbs: [{ label: 'Home', path: ROUTES.HOME }, { label: '404' }],
  },
];

