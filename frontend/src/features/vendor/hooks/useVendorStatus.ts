/**
 * useVendorStatus Hook
 *
 * Manages vendor online/offline status with real-time updates.
 * Auto-offlines vendor when outside working hours (from Settings).
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  getVendorStatus,
  toggleVendorStatus,
  getVendorProfile,
} from '@/features/vendor/services/vendorService';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function isWithinWorkingHours(
  workingDays: string[] | null | undefined,
  operationalHours: Record<string, { open: string; close: string }> | null | undefined
): boolean {
  if (!workingDays?.length || !operationalHours) return true; // No config = assume always open

  const now = new Date();
  const today = DAY_NAMES[now.getDay()];
  const todayLower = today.toLowerCase();
  const isWorkingDay = workingDays.some((d) => d.toLowerCase() === todayLower);
  if (!isWorkingDay) return false;

  const dayKey = todayLower;
  const hours = operationalHours[dayKey];
  if (!hours?.open || !hours?.close) return true;

  const pad = (n: number) => String(n).padStart(2, '0');
  const current = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return current >= hours.open && current <= hours.close;
}

export const useVendorStatus = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const autoOfflineInProgress = useRef(false);

  // Load initial status
  useEffect(() => {
    const loadStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const { data, error: statusError } = await getVendorStatus(user.id);

        if (statusError) {
          console.error('Error loading vendor status:', statusError);
          setError('Failed to load vendor status');
          return;
        }

        setIsOnline(data ?? false);
      } catch (err) {
        console.error('Error loading vendor status:', err);
        setError('Failed to load vendor status');
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
  }, [user?.id]);

  // Auto-offline when outside working hours
  useEffect(() => {
    if (!user?.id || !isOnline) return;

    const checkAndAutoOffline = async () => {
      if (autoOfflineInProgress.current) return;

      try {
        const { data: profile } = await getVendorProfile(user.id);
        const workingDays = profile?.working_days as string[] | undefined;
        const operationalHours = profile?.operational_hours as
          | Record<string, { open: string; close: string }>
          | undefined;

        if (!isWithinWorkingHours(workingDays, operationalHours)) {
          autoOfflineInProgress.current = true;
          const { error: toggleError } = await toggleVendorStatus(user.id, false);
          if (!toggleError) {
            setIsOnline(false);
          }
        }
      } catch (err) {
        console.error('Auto-offline check failed:', err);
      } finally {
        autoOfflineInProgress.current = false;
      }
    };

    checkAndAutoOffline();
    const interval = setInterval(checkAndAutoOffline, 60_000);
    return () => clearInterval(interval);
  }, [user?.id, isOnline]);

  // Toggle online/offline status
  const toggleStatus = async () => {
    if (!user?.id || isToggling) return;

    const newStatus = !isOnline;

    try {
      setIsToggling(true);
      setError(null);

      const { data, error: toggleError } = await toggleVendorStatus(user.id, newStatus);

      if (toggleError) {
        console.error('Error toggling vendor status:', toggleError);
        setError('Failed to update vendor status');
        return;
      }

      setIsOnline(newStatus);
    } catch (err) {
      console.error('Error toggling vendor status:', err);
      setError('Failed to update vendor status');
    } finally {
      setIsToggling(false);
    }
  };

  return {
    isOnline,
    isLoading,
    isToggling,
    error,
    toggleStatus,
  };
};

