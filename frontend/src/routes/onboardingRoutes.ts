/**
 * Onboarding Routes Configuration
 * 
 * Routes for vendor onboarding flow (multi-stage).
 */

import { lazy } from 'react';
import { ROUTES } from '@/constants/routes';
import type { RouteConfig } from './types';

// Lazy load onboarding components
const OnboardingLayout = lazy(() => import('@/features/vendor/onboarding/OnboardingLayout'));
const OnboardingStage1 = lazy(() => import('@/features/vendor/onboarding/stage-1/OnboardingStage1'));
const OnboardingStage2 = lazy(() => import('@/features/vendor/onboarding/stage-2/OnboardingStage2'));
const OnboardingStage3 = lazy(() => import('@/features/vendor/onboarding/stage-3/OnboardingStage3'));
const OnboardingCompletion = lazy(() => import('@/features/vendor/onboarding/completion/OnboardingCompletion'));

export const onboardingRoutes: RouteConfig[] = [
  {
    path: ROUTES.VENDOR_ONBOARDING_STAGE_1,
    component: OnboardingStage1,
    title: 'Onboarding - Stage 1 - PocketShop',
    requiresAuth: true,
    requiresOnboarding: false,
    onboardingStage: 1,
    accessLevel: 'vendor',
    layout: OnboardingLayout,
    loadingVariant: 'onboarding',
    breadcrumbs: [
      { label: 'Home', path: ROUTES.HOME },
      { label: 'Onboarding', path: ROUTES.VENDOR_ONBOARDING },
      { label: 'Stage 1: Basic Info' },
    ],
  },
  {
    path: ROUTES.VENDOR_ONBOARDING_STAGE_2,
    component: OnboardingStage2,
    title: 'Onboarding - Stage 2 - PocketShop',
    requiresAuth: true,
    requiresOnboarding: false,
    onboardingStage: 2,
    accessLevel: 'vendor',
    layout: OnboardingLayout,
    loadingVariant: 'onboarding',
    breadcrumbs: [
      { label: 'Home', path: ROUTES.HOME },
      { label: 'Onboarding', path: ROUTES.VENDOR_ONBOARDING },
      { label: 'Stage 2: Operational Details' },
    ],
  },
  {
    path: ROUTES.VENDOR_ONBOARDING_STAGE_3,
    component: OnboardingStage3,
    title: 'Onboarding - Stage 3 - PocketShop',
    requiresAuth: true,
    requiresOnboarding: false,
    onboardingStage: 3,
    accessLevel: 'vendor',
    layout: OnboardingLayout,
    loadingVariant: 'onboarding',
    breadcrumbs: [
      { label: 'Home', path: ROUTES.HOME },
      { label: 'Onboarding', path: ROUTES.VENDOR_ONBOARDING },
      { label: 'Stage 3: Choose Plan' },
    ],
  },
  {
    path: ROUTES.VENDOR_ONBOARDING_COMPLETION,
    component: OnboardingCompletion,
    title: 'Onboarding - Completion - PocketShop',
    requiresAuth: true,
    requiresOnboarding: false,
    onboardingStage: 'completion',
    accessLevel: 'vendor',
    layout: OnboardingLayout,
    loadingVariant: 'onboarding',
    breadcrumbs: [
      { label: 'Home', path: ROUTES.HOME },
      { label: 'Onboarding', path: ROUTES.VENDOR_ONBOARDING },
      { label: 'Completion' },
    ],
  },
  {
    path: ROUTES.VENDOR_ONBOARDING,
    redirect: ROUTES.VENDOR_ONBOARDING_STAGE_1,
    title: 'Redirect to Onboarding Stage 1',
    requiresAuth: true,
    requiresOnboarding: false,
    accessLevel: 'vendor',
    replace: true,
  },
];

