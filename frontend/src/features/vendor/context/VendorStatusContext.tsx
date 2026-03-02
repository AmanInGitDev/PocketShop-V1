/**
 * VendorStatusContext - Single source of truth for vendor online/offline status
 * and operational hours (extended session, pre-closing banner, etc.).
 */

import { createContext, useContext, ReactNode } from 'react';
import { useVendorStatus } from '@/features/vendor/hooks/useVendorStatus';

type VendorStatusContextValue = ReturnType<typeof useVendorStatus>;

const VendorStatusContext = createContext<VendorStatusContextValue | null>(null);

export function VendorStatusProvider({ children }: { children: ReactNode }) {
  const value = useVendorStatus();
  return (
    <VendorStatusContext.Provider value={value}>
      {children}
    </VendorStatusContext.Provider>
  );
}

export function useVendorStatusContext(): VendorStatusContextValue {
  const ctx = useContext(VendorStatusContext);
  if (!ctx) {
    throw new Error('useVendorStatusContext must be used within VendorStatusProvider');
  }
  return ctx;
}
