import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useEffect } from 'react';
import { useVendor } from './useVendor';

export const useOrders = () => {
  const { data: vendor } = useVendor();

  const query = useQuery({
    queryKey: ['orders', vendor?.id],
    queryFn: async () => {
      if (!vendor?.id) throw new Error('No vendor ID');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            subtotal,
            product_id,
            products (
              id,
              name,
              image_url
            )
          )
        `)
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.id,
  });

  // Set up realtime subscription for orders
  useEffect(() => {
    if (!vendor?.id) return;

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `vendor_id=eq.${vendor.id}`,
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendor?.id, query]);

  return query;
};
