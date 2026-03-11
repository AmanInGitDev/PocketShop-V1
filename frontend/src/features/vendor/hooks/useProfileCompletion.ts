import { useMemo } from 'react';
import { useVendor } from '@/features/vendor/hooks/useVendor';
import { getProfileCompletion } from '@/features/vendor/utils/profileCompletion';

export function useProfileCompletion() {
  const { data: vendor } = useVendor();

  return useMemo(() => {
    const { percentage, canGoOnline, missingRequired } = getProfileCompletion(vendor ?? null);
    return {
      percentage,
      canGoOnline,
      missingRequired,
      isComplete: canGoOnline,
    };
  }, [vendor]);
}
