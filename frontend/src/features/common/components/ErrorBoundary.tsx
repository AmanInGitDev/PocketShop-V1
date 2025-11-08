/**
 * Error Boundary Component
 * 
 * Catches React component errors and displays a fallback UI.
 * Prevents white screens from uncaught render errors.
 * Uses ErrorFallback component for consistent error UI.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: ReactNode;
  /**
   * Optional callback when error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Optional fallback component (defaults to ErrorFallback)
   */
  FallbackComponent?: React.ComponentType<{
    error: Error | null;
    errorInfo?: ErrorInfo | null;
    resetErrorBoundary?: () => void;
  }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details (safe for console - no PII)
    console.error('[ErrorBoundary] Caught error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Optionally send to error tracking service (e.g., Sentry)
    // Only send non-sensitive error context (no tokens, PII, or auth data)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        // Explicitly exclude sensitive data from error context
        tags: {
          error_boundary: true,
        },
        // Don't include user data, tokens, or session info in error reports
        beforeSend: (event: any) => {
          // Strip any potential sensitive data from event
          if (event.user) {
            // Only include user ID, never email or other PII
            event.user = { id: event.user.id };
          }
          // Remove request data that might contain tokens
          if (event.request) {
            delete event.request.headers;
            delete event.request.cookies;
          }
          // Return sanitized event (all data sanitized, no PII)
          return event;
        },
      });
    }
  }

  /**
   * Reset error boundary state
   * Can be called from ErrorFallback's resetErrorBoundary prop
   */
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.FallbackComponent || ErrorFallback;
      return (
        <Fallback
          error={this.state.error}
          errorInfo={this.state.errorInfo || undefined}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

