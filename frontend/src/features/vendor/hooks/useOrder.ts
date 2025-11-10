import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';
import { useVendor } from './useVendor';

export const useOrder = (orderId: string | undefined) => {
  const { data: vendor } = useVendor();

  const query = useQuery({
    queryKey: ['order', orderId, vendor?.id],
    queryFn: async () => {
      if (!vendor?.id || !orderId) throw new Error('No vendor ID or order ID');

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('vendor_id', vendor.id)
        .single();

      if (error) {
        // If table doesn't exist, return null instead of throwing
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.error('orders table does not exist. Please run database setup SQL files.');
          return null;
        }
        throw error;
      }
      return data;
    },
    enabled: !!vendor?.id && !!orderId,
    retry: false, // Don't retry on error
  });

  // Set up realtime subscription for order updates
  useEffect(() => {
    if (!vendor?.id || !orderId) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendor?.id, orderId, query]);

  return query;
};

