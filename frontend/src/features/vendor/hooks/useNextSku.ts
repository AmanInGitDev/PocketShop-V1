import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useVendor } from './useVendor';
import { useProducts } from './useProducts';

/**
 * Returns the next available SKU for the current vendor.
 * Format: PROD-1, PROD-2, ...
 * Uses RPC get_next_sku if available (prefers released numbers from deleted products).
 * Falls back to max(existing) + 1 if RPC not found.
 */
export function useNextSku(enabled = true) {
  const { data: vendor } = useVendor();
  const { data: products = [] } = useProducts();

  return useQuery({
    queryKey: ['nextSku', vendor?.id, products.length],
    queryFn: async () => {
      if (!vendor?.id) return null;

      // Try RPC first (requires sku_auto_generate_migration.sql)
      const { data, error } = await supabase.rpc('get_next_sku', {
        p_vendor_id: vendor.id,
      });

      if (!error && data) return data as string;

      // Fallback: compute from existing products
      const nums = (products as { sku?: string }[])
        .map((p) => {
          const m = p.sku?.match(/^PROD-(\d+)$/);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => n > 0);
      const max = nums.length ? Math.max(...nums) : 0;
      return `PROD-${max + 1}`;
    },
    enabled: enabled && !!vendor?.id,
  });
}
