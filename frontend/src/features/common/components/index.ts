/**
 * Component Library Exports
 * 
 * Central export file for all reusable components.
 */

export { default as Button } from './Button';
export type { ButtonProps } from './Button';

export { default as Card } from './Card';
export type { CardProps } from './Card';

export { default as Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { default as Input } from './Input';
export type { InputProps } from './Input';

export { ProtectedRoute } from './shared/ProtectedRoute';
export { OnboardingProtectedRoute } from './shared/OnboardingProtectedRoute';
export { AuthRouteGuard } from './shared/AuthRouteGuard';
export { Button as OnboardingButton } from './shared/Button';
export { InputField } from './shared/InputField';
export { StageIndicator } from './shared/StageIndicator';

export { default as LocationDetector } from './LocationDetector';
export type { LocationDetectorRef } from './LocationDetector';
export { default as PlacesAutocomplete } from './PlacesAutocomplete';

export { default as LoadingScreen } from './LoadingScreen';
export { default as ErrorBoundary } from './ErrorBoundary';
export { ErrorFallback } from './ErrorFallback';
export { LoadingFallback } from './LoadingFallback';
export { RouteSkeleton } from './RouteSkeleton';

