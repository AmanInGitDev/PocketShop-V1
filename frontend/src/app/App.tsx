/**
 * Main App Component
 * 
 * Application entry point with routing and auth provider.
 * Includes PWA hooks and offline indicator (non-blocking).
 */

import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { LoadingScreen } from '@/features/common/components/LoadingScreen';
import { ErrorBoundary } from '@/features/common/components';
import { AppRoutes } from './routes/AppRoutes';
import OfflineIndicator from '@/components/OfflineIndicator';
import { usePWA } from '@/hooks/usePWA';

// Inner component that has access to auth context
const AppContent = () => {
  const { loading } = useAuth();

  // Show loading screen during initial auth check
  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return <AppRoutes />;
};

// Main App Router
function App() {
  // Initialize PWA hook (non-blocking, detects installability)
  // Currently not used but available for future install prompt UI
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isInstalled, isInstallable } = usePWA();

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          {/* Offline indicator - shows when network is unavailable */}
          <OfflineIndicator />
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
