/**
 * Order Service
 * 
 * Handles all order-related operations
 */

import { supabase } from '@/lib/supabaseClient';

export const createOrder = async (orderData: {
  business_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  total_amount: number;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    special_instructions?: string;
  }>;
  notes?: string;
}) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();
  return { data, error };
};

export const getOrders = async (businessId: string, status?: string) => {
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('business_id', businessId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
};

export const updateOrderStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const subscribeToOrders = (
  businessId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `business_id=eq.${businessId}`,
      },
      callback
    )
    .subscribe();
};

