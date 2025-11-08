/**
 * PocketShop — IOrderRepository Interface
 * ----------------------------------------
 * Core data contract for any order data source.
 * Implement this interface for:
 *  - DemoOrderRepository (local JSON)
 *  - SupabaseOrderRepository (Postgres/Realtime)
 *  - Future integrations (Firebase, local cache, etc.)
 */

import type { Order, MenuItem, ItemStock } from '@/types';

/**
 * Generic repository interface for order operations.
 * Each method may be async (Promise-based) to support
 * both REST and realtime DB drivers.
 */
export interface IOrderRepository {
  /**
   * Fetch all active orders for a vendor.
   * Must return the latest canonical list.
   */
  fetchOrders(vendorId: string): Promise<Order[]>;

  /**
   * Optional realtime subscription.
   * Should push fresh order data whenever updates occur.
   * Returns an unsubscribe function.
   */
  subscribeToOrders?(
    vendorId: string,
    cb: (orders: Order[]) => void
  ): () => void;

  /**
   * Change an order's status with concurrency safety.
   * Implementations should use optimistic locking
   * or version-based updates.
   */
  changeOrderStatus(
    vendorId: string,
    orderId: string,
    newStatus: string,
    clientTxnId?: string
  ): Promise<Order>;

  /**
   * Optional — fetch vendor's menu items.
   * Helps detail panels or quick order creation.
   */
  fetchMenuItems?(vendorId: string): Promise<MenuItem[]>;

  /**
   * Optional — toggle item availability.
   * Some vendors can mark items out of stock
   * temporarily or permanently.
   */
  toggleItemStock?(
    itemId: string,
    inStock: boolean,
    until?: string | null
  ): Promise<void>;

  /**
   * Optional — preload stock info.
   * Useful for inventory and analytics.
   */
  fetchItemStock?(vendorId: string): Promise<Record<string, ItemStock>>;

  /**
   * Optional — create a new order (for testing or POS).
   * Must be idempotent when idempotencyKey provided.
   */
  createOrder?(
    vendorId: string,
    payload: {
      items: { itemId: string; qty: number }[];
      total: number;
      idempotencyKey?: string;
    }
  ): Promise<Order>;
}

export default IOrderRepository;

