/**
 * Supabase Order Repository
 *
 * Fetches orders from Supabase (vendor_profiles.id = vendor_id).
 * Maps DB schema (pending, preparing, ready, etc.) to frontend Order type (NEW, IN_PROGRESS, etc.)
 */

import type IOrderRepository from '@/services/IOrderRepository';
import type { Order, OrderStatus, MenuItem, ItemStock } from '@/types';
import { supabase } from '@/lib/supabaseClient';

// DB status -> frontend OrderStatus
// PHASE4/schema may use 'processing' (not 'preparing'/'confirmed'); support both
const DB_TO_UI_STATUS: Record<string, OrderStatus> = {
  pending: 'NEW',
  confirmed: 'NEW',
  preparing: 'IN_PROGRESS',
  processing: 'IN_PROGRESS',
  ready: 'READY',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

// Frontend OrderStatus -> DB status
// Use 'processing' for IN_PROGRESS (PHASE4_MIGRATION uses pending|processing|ready|completed|cancelled)
const UI_TO_DB_STATUS: Record<OrderStatus, string> = {
  NEW: 'pending',
  IN_PROGRESS: 'processing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// DB payment_status (orders table: unpaid/paid/refunded) -> frontend PaymentStatus
const DB_TO_UI_PAYMENT: Record<string, 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'> = {
  unpaid: 'PENDING',
  paid: 'PAID',
  refunded: 'REFUNDED',
};

// payments.payment_status (enum: pending/completed/failed) -> treat completed as PAID
function resolvePaymentStatus(
  orderPaymentStatus: string | undefined,
  payments: { payment_status?: string }[] | { payment_status?: string } | null | undefined
): 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | undefined {
  const payList = Array.isArray(payments) ? payments : payments ? [payments] : [];
  const hasCompleted = payList.some((p) => (p?.payment_status ?? '').toLowerCase() === 'completed');
  if (hasCompleted) return 'PAID';
  if (orderPaymentStatus) return DB_TO_UI_PAYMENT[orderPaymentStatus];
  return undefined;
}

function mapDbOrderToOrder(row: any): Order {
  const items = Array.isArray(row.items) ? row.items : [];
  const orderItems = items.map((it: any, idx: number) => ({
    itemId: it.product_id ?? it.itemId ?? String(idx),
    qty: it.quantity ?? it.qty ?? 1,
    price: Number(it.price ?? 0),
    name: it.name,
  }));
  const itemsCount = orderItems.reduce((sum: number, it: any) => sum + (it.qty ?? 0), 0);
  const total = Number(row.total_amount ?? row.total ?? 0) || orderItems.reduce((s: number, it: any) => s + (it.qty ?? 0) * (it.price ?? 0), 0);

  return {
    id: row.id,
    vendorId: row.vendor_id,
    total,
    status: DB_TO_UI_STATUS[row.status] ?? 'NEW',
    paymentStatus: resolvePaymentStatus(row.payment_status, row.payments),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
    version: 1,
    items: orderItems,
    customerName: row.customer_name ?? row.customerName,
    orderNumber: row.order_number ?? row.orderNumber,
    paymentMethod: mapPaymentMethod(row.payment_method ?? row.paymentMethod),
    itemsCount,
  };
}

function mapPaymentMethod(v?: string | null): Order['paymentMethod'] {
  if (!v) return undefined;
  const u = (v || '').toLowerCase();
  if (u === 'cash') return 'CASH';
  if (u === 'card') return 'CARD';
  if (u === 'upi' || u === 'google_pay') return 'GOOGLE_PAY';
  if (u === 'paytm') return 'PAYTM';
  if (u === 'phonepe') return 'PHONEPE';
  return u.toUpperCase() as Order['paymentMethod'];
}

export class SupabaseOrderRepository implements IOrderRepository {
  async fetchOrders(vendorId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, payments(payment_status)')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.error('orders table does not exist.');
        return [];
      }
      throw error;
    }

    return (data ?? []).map(mapDbOrderToOrder);
  }

  subscribeToOrders(vendorId: string, cb: (orders: Order[]) => void): () => void {
    let mounted = true;

    // Initial fetch
    this.fetchOrders(vendorId).then((orders) => {
      if (mounted) cb(orders);
    });

    const channel = supabase
      .channel(`orders-${vendorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `vendor_id=eq.${vendorId}`,
        },
        () => {
          if (mounted) {
            this.fetchOrders(vendorId).then((orders) => cb(orders));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }

  async changeOrderStatus(
    vendorId: string,
    orderId: string,
    newStatus: string,
    _clientTxnId?: string
  ): Promise<Order> {
    const dbStatus = UI_TO_DB_STATUS[newStatus as OrderStatus] ?? newStatus;

    const { data, error } = await supabase
      .from('orders')
      .update({ status: dbStatus })
      .eq('id', orderId)
      .eq('vendor_id', vendorId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Order not found');

    return mapDbOrderToOrder(data);
  }

  async fetchMenuItems(vendorId: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data ?? []).map((p: any) => ({
      id: p.id,
      vendorId: p.vendor_id,
      name: p.name,
      description: p.description,
      price: Number(p.price ?? 0),
      status: p.is_available ? 'ACTIVE' : 'ARCHIVED',
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  }

  async fetchItemStock(_vendorId: string): Promise<Record<string, ItemStock>> {
    return {};
  }
}
