import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useEffect } from 'react';
import { useVendor } from './useVendor';

export const useProducts = () => {
  const { data: vendor } = useVendor();

  const query = useQuery({
    queryKey: ['products', vendor?.id],
    queryFn: async () => {
      if (!vendor?.id) throw new Error('No vendor ID');

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.id,
  });

  // Set up realtime subscription for products
  useEffect(() => {
    if (!vendor?.id) return;

    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
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
