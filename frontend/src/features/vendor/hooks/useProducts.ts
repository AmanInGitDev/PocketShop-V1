import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
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

      if (error) {
        // If table doesn't exist, return empty array instead of throwing
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.error('products table does not exist. Please run database setup SQL files.');
          return [];
        }
        throw error;
      }
      return data || [];
    },
    enabled: !!vendor?.id,
    retry: false, // Don't retry on error
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

export const useProduct = (productId: string | undefined) => {
  const { data: vendor } = useVendor();

  return useQuery({
    queryKey: ['product', productId, vendor?.id],
    queryFn: async () => {
      if (!vendor?.id || !productId) throw new Error('No vendor ID or product ID');

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('vendor_id', vendor.id)
        .single();

      if (error) {
        // If table doesn't exist, return null instead of throwing
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.error('products table does not exist. Please run database setup SQL files.');
          return null;
        }
        throw error;
      }
      return data;
    },
    enabled: !!vendor?.id && !!productId,
    retry: false, // Don't retry on error
  });
};
