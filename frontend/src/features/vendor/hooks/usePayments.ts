import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useVendor } from './useVendor';

export const usePayments = () => {
  const { data: vendor } = useVendor();

  return useQuery({
    queryKey: ['payments', vendor?.id],
    queryFn: async () => {
      if (!vendor?.id) throw new Error('No vendor ID');

      // First get all order IDs for this vendor
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('vendor_id', vendor.id);

      if (ordersError) throw ordersError;

      const orderIds = orders?.map(o => o.id) || [];

      if (orderIds.length === 0) return [];

      // Then get payments for those orders
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders (
            id,
            order_number,
            customer_name,
            created_at
          )
        `)
        .in('order_id', orderIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.id,
  });
};

export const usePaymentStats = () => {
  const { data: vendor } = useVendor();

  return useQuery({
    queryKey: ['payment-stats', vendor?.id],
    queryFn: async () => {
      if (!vendor?.id) throw new Error('No vendor ID');

      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, payment_status, created_at, orders!inner(vendor_id)')
        .eq('orders.vendor_id', vendor.id);

      if (error) throw error;

      const totalRevenue = payments
        .filter(p => p.payment_status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const pendingPayouts = payments
        .filter(p => p.payment_status === 'pending')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const thisMonth = payments
        .filter(p => {
          const date = new Date(p.created_at);
          const now = new Date();
          return date.getMonth() === now.getMonth() && 
                 date.getFullYear() === now.getFullYear() &&
                 p.payment_status === 'completed';
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);

      return {
        totalRevenue,
        pendingPayouts,
        thisMonth,
      };
    },
    enabled: !!vendor?.id,
  });
};
