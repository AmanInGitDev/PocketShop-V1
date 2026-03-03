/**
 * Offline Indicator Component
 *
 * Simple visual indicator that appears when the user is offline.
 * Positions above the CustomerBottomNav on mobile when on customer routes.
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { WifiOff } from 'lucide-react';

function isCustomerRoute(pathname: string): boolean {
  if (pathname === '/customer-home' || pathname === '/customer-profile') return true;
  if (pathname.startsWith('/storefront/') || pathname.startsWith('/order-tracking/')) return true;
  if (pathname === '/shops' || pathname.startsWith('/shops')) return true;
  return false;
}

export default function OfflineIndicator() {
  const location = useLocation();
  const onCustomerRoute = isCustomerRoute(location.pathname);
  const [online, setOnline] = useState(window.navigator.onLine);
  const [show, setShow] = useState(!window.navigator.onLine);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const updateOnlineStatus = () => {
      const isOnline = window.navigator.onLine;
      setOnline(isOnline);
      
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // Show indicator when going offline
      if (!isOnline) {
        setShow(true);
      } else {
        // Hide indicator after a brief delay when coming back online
        timeoutId = setTimeout(() => {
          setShow(false);
        }, 2000);
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Don't render if online (or if show is false after delay)
  if (online && !show) return null;

  return (
    <div
      className={`
        fixed right-4 z-50
        ${online ? 'bg-green-600' : 'bg-red-600'}
        text-white px-4 py-2.5 rounded-lg shadow-lg
        flex items-center gap-2
        text-sm font-medium
        transition-all duration-300 ease-in-out
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
      `}
      style={{
        bottom: onCustomerRoute
          ? 'calc(5.5rem + env(safe-area-inset-bottom, 0px))'
          : 'max(1rem, env(safe-area-inset-bottom, 1rem))',
      }}
      role="status"
      aria-live="polite"
      aria-label={online ? 'Back online' : 'Offline mode'}
    >
      <WifiOff className="w-4 h-4" />
      <span>{online ? 'Back online' : 'Offline mode'}</span>
    </div>
  );
}

