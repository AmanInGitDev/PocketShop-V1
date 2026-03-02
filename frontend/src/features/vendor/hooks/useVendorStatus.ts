/**
 * useVendorStatus Hook
 *
 * Manages vendor online/offline status with real-time updates.
 * Auto-offlines vendor when outside working hours (from Settings).
 * Supports extended sessions (30 min) when outside hours.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  getVendorStatus,
  toggleVendorStatus,
  getVendorProfile,
} from '@/features/vendor/services/vendorService';
import { getOperationalInfo, type OperationalInfo } from '@/features/vendor/utils/operationalHoursUtils';
import { toast } from 'sonner';

const EXTENDED_SESSION_KEY_PREFIX = 'pocketshop_extended_until_';

function getExtendedUntilKey(userId: string): string {
  return `${EXTENDED_SESSION_KEY_PREFIX}${userId}`;
}

function getExtendedUntil(userId: string): number | null {
  if (!userId) return null;
  try {
    const stored = localStorage.getItem(getExtendedUntilKey(userId));
    if (!stored) return null;
    const ts = parseInt(stored, 10);
    return isNaN(ts) ? null : ts;
  } catch {
    return null;
  }
}

function setExtendedUntil(userId: string, timestamp: number | null): void {
  if (!userId) return;
  try {
    if (timestamp === null) {
      localStorage.removeItem(getExtendedUntilKey(userId));
    } else {
      localStorage.setItem(getExtendedUntilKey(userId), String(timestamp));
    }
  } catch {
    // ignore
  }
}

export type ToggleResult =
  | { success: true }
  | { success: false; needExtensionModal: true }
  | { success: false; needExtensionModal?: false };

export const useVendorStatus = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [operationalInfo, setOperationalInfo] = useState<OperationalInfo | null>(null);
  const [extendedUntil, setExtendedUntilState] = useState<number | null>(() =>
    user?.id ? getExtendedUntil(user.id) : null
  );
  const autoOfflineInProgress = useRef(false);

  const isInExtendedSession = extendedUntil != null && Date.now() < extendedUntil;

  // Load initial status and profile
  useEffect(() => {
    const loadStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const [statusResult, profileResult] = await Promise.all([
          (async () => {
            const { data, error: statusError } = await getVendorStatus(user.id);
            return { data: data ?? false, error: statusError };
          })(),
          getVendorProfile(user.id),
        ]);

        if (statusResult.error) {
          console.error('Error loading vendor status:', statusResult.error);
          setError('Failed to load vendor status');
          return;
        }

        setIsOnline(statusResult.data);

        const workingDays = profileResult.data?.working_days as string[] | undefined;
        const operationalHours = profileResult.data?.operational_hours as
          | Record<string, { open: string; close: string }>
          | undefined;
        setOperationalInfo(getOperationalInfo(workingDays, operationalHours));

        const stored = getExtendedUntil(user.id);
        if (stored && stored < Date.now()) {
          setExtendedUntil(user.id, null);
          setExtendedUntilState(null);
        } else {
          setExtendedUntilState(stored);
        }
      } catch (err) {
        console.error('Error loading vendor status:', err);
        setError('Failed to load vendor status');
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
  }, [user?.id]);

  // Refresh operational info periodically (every minute)
  useEffect(() => {
    if (!user?.id) return;
    const refresh = async () => {
      const { data } = await getVendorProfile(user.id);
      const workingDays = data?.working_days as string[] | undefined;
      const operationalHours = data?.operational_hours as
        | Record<string, { open: string; close: string }>
        | undefined;
      setOperationalInfo(getOperationalInfo(workingDays, operationalHours));
    };
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Auto-offline when outside working hours or when extended session ends
  useEffect(() => {
    if (!user?.id || !isOnline) return;

    const checkAndAutoOffline = async () => {
      if (autoOfflineInProgress.current) return;

      const now = Date.now();
      if (extendedUntil != null && now < extendedUntil) {
        return; // Still in extended session
      }

      if (extendedUntil != null && now >= extendedUntil) {
        autoOfflineInProgress.current = true;
        setExtendedUntil(user.id, null);
        setExtendedUntilState(null);
        const { error: toggleError } = await toggleVendorStatus(user.id, false);
        if (!toggleError) {
          setIsOnline(false);
          toast.info('Extended session ended. You are now offline.');
        }
        autoOfflineInProgress.current = false;
        return;
      }

      try {
        const { data: profile } = await getVendorProfile(user.id);
        const workingDays = profile?.working_days as string[] | undefined;
        const operationalHours = profile?.operational_hours as
          | Record<string, { open: string; close: string }>
          | undefined;
        const info = getOperationalInfo(workingDays, operationalHours);

        if (info.hasOperationalHours && info.isOutsideHours) {
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
  }, [user?.id, isOnline, extendedUntil]);

  const toggleStatus = useCallback(async (): Promise<ToggleResult> => {
    if (!user?.id || isToggling) return { success: false };

    if (isOnline) {
      try {
        setIsToggling(true);
        setError(null);
        setExtendedUntil(user.id, null);
        setExtendedUntilState(null);
        const { error: toggleError } = await toggleVendorStatus(user.id, false);
        if (toggleError) {
          setError('Failed to update vendor status');
          return { success: false };
        }
        setIsOnline(false);
        return { success: true };
      } catch (err) {
        setError('Failed to update vendor status');
        return { success: false };
      } finally {
        setIsToggling(false);
      }
    }

    // Going online: check if outside hours
    const stored = getExtendedUntil(user.id);
    const inExt = stored != null && Date.now() < stored;
    if (!inExt && operationalInfo?.hasOperationalHours && operationalInfo.isOutsideHours) {
      return { success: false, needExtensionModal: true };
    }

    try {
      setIsToggling(true);
      setError(null);
      const { data, error: toggleError } = await toggleVendorStatus(user.id, true);
      if (toggleError) {
        setError('Failed to update vendor status');
        return { success: false };
      }
      setIsOnline(data?.is_active ?? true);
      return { success: true };
    } catch (err) {
      setError('Failed to update vendor status');
      return { success: false };
    } finally {
      setIsToggling(false);
    }
  }, [user?.id, isOnline, isToggling, operationalInfo]);

  const goOnlineWithExtension = useCallback(
    async (minutes: number = 30): Promise<boolean> => {
      if (!user?.id || isToggling) return false;
      try {
        setIsToggling(true);
        setError(null);
        const endAt = Date.now() + minutes * 60 * 1000;
        setExtendedUntil(user.id, endAt);
        setExtendedUntilState(endAt);
        const { data, error: toggleError } = await toggleVendorStatus(user.id, true);
        if (toggleError) {
          setError('Failed to update vendor status');
          return false;
        }
        setIsOnline(data?.is_active ?? true);
        return true;
      } catch (err) {
        setError('Failed to update vendor status');
        return false;
      } finally {
        setIsToggling(false);
      }
    },
    [user?.id, isToggling]
  );

  const extendSession = useCallback(
    (minutes: number = 30): void => {
      if (!user?.id) return;
      const currentEnd = extendedUntil ?? Date.now();
      const newEnd = Math.max(currentEnd, Date.now()) + minutes * 60 * 1000;
      setExtendedUntil(user.id, newEnd);
      setExtendedUntilState(newEnd);
      toast.success(`Session extended by ${minutes} minutes`);
    },
    [user?.id, extendedUntil]
  );

  /** Extend past closing time (e.g. when within 30 mins of closing). Adds minutes past current closing. */
  const extendPastClosing = useCallback(
    (minutes: number = 30): void => {
      if (!user?.id || !operationalInfo?.minutesUntilClosing) return;
      const msUntilClosing = operationalInfo.minutesUntilClosing * 60 * 1000;
      const newEnd = Date.now() + msUntilClosing + minutes * 60 * 1000;
      setExtendedUntil(user.id, newEnd);
      setExtendedUntilState(newEnd);
      toast.success(`Session extended by ${minutes} minutes past closing`);
    },
    [user?.id, operationalInfo?.minutesUntilClosing]
  );

  // Live countdown for extended session (updates every 30 seconds)
  const [, setTick] = useState(0);
  useEffect(() => {
    if (extendedUntil == null || Date.now() >= extendedUntil) return;
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, [extendedUntil]);

  const minutesRemainingInExtendedSession =
    extendedUntil != null && Date.now() < extendedUntil
      ? Math.max(0, Math.ceil((extendedUntil - Date.now()) / 60000))
      : null;

  return {
    isOnline,
    isLoading,
    isToggling,
    error,
    toggleStatus,
    goOnlineWithExtension,
    extendSession,
    extendPastClosing,
    operationalInfo,
    isInExtendedSession,
    minutesRemainingInExtendedSession,
    extendedUntil,
  };
};
