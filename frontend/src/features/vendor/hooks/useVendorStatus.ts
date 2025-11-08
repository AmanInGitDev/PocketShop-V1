/**
 * useVendorStatus Hook
 * 
 * Manages vendor online/offline status with real-time updates
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getVendorStatus, toggleVendorStatus } from '@/features/vendor/services/vendorService';

export const useVendorStatus = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

