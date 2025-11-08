/**
 * Demo Order Repository
 * 
 * Loads demo orders and menu items from JSON files for UI development.
 * Simulates network latency and occasional failures for testing optimistic updates.
 * 
 * Implements IOrderRepository interface for consistent data access patterns.
 * This is a demo-first approach - will be replaced with Supabase integration later.
 */

import type IOrderRepository from '@/services/IOrderRepository';
import type { Order, OrderStatus, MenuItem, ItemStock } from '@/types';

// Import demo data from JSON files
import demoMenu from '@/data/demo/menu.json';
import demoOrders from '@/data/demo/orders.json';

// --- Configuration ---

const LATENCY_MIN = 200;
const LATENCY_JITTER = 200;
const WRITE_FAIL_RATE = 0.05; // ~5% failure rate for testing

// --- Helpers ---

function delay(ms = LATENCY_MIN): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms + Math.random() * LATENCY_JITTER));
}

function shouldFail(): boolean {
  return Math.random() < WRITE_FAIL_RATE;
}

// Allowed status transitions
const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['READY', 'CANCELLED'],
  READY: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

// --- Class Implementation ---

export class DemoOrderRepository implements IOrderRepository {
  // Made protected for backward compatibility with legacy functions
  // In production, these should remain private
  protected orders: Order[] = [];
  protected menu: MenuItem[] = [];
  private stock: Record<string, ItemStock> = {};
  private subs: Set<(orders: Order[]) => void> = new Set();

  constructor(seedOrders?: Order[], seedMenu?: MenuItem[]) {
    // Hydrate from JSON once; clone to avoid direct mutation of imported objects
    const now = new Date().toISOString();

    this.menu = (seedMenu ?? (demoMenu as MenuItem[])).map((m) => ({ ...m }));
    
    (seedOrders ?? (demoOrders as Order[])).forEach((o) => {
      // Normalize minimal required fields for safety
      this.orders.push({
        ...o,
        createdAt: o.createdAt ?? now,
        updatedAt: o.updatedAt ?? now,
        version: o.version ?? 1,
        items: o.items.map(item => ({
          ...item,
          // Ensure items have required fields
          qty: (item as any).qty ?? (item as any).quantity ?? 1,
        })),
      });
    });

    // Default stock = in stock for all menu items
    this.stock = this.menu.reduce<Record<string, ItemStock>>((acc, m) => {
      acc[m.id] = {
        itemId: m.id,
        inStock: m.status === 'ACTIVE',
        updatedAt: now,
        qty: null,
      };
      return acc;
    }, {});
  }

  // --- Pub/Sub ---

  private emit(_vendorId?: string): void {
    const snapshot = this.orders.map((o) => ({
      ...o,
      items: o.items.map((i) => ({ ...i })),
    }));
    // Notify all subscribers (they filter by vendorId in their wrappers)
    this.subs.forEach((cb) => cb(snapshot));
  }

  subscribeToOrders(vendorId: string, cb: (orders: Order[]) => void): () => void {
    // Create wrapper that filters by vendorId
    const wrappedCb = (allOrders: Order[]) => {
      const filtered = allOrders.filter(o => o.vendorId === vendorId);
      cb(filtered);
    };
    
    // Push initial state (filtered by vendorId)
    this.fetchOrders(vendorId).then(cb);
    
    // Add wrapped callback
    this.subs.add(wrappedCb);
    
    return () => this.subs.delete(wrappedCb);
  }

  // --- Reads ---

  async fetchOrders(vendorId: string): Promise<Order[]> {
    await delay();
    
    return this.orders
      .filter((o) => o.vendorId === vendorId)
      .map((o) => ({
        ...o,
        items: o.items.map((i) => ({ ...i })),
      }));
  }

  async fetchMenuItems(vendorId: string): Promise<MenuItem[]> {
    await delay(100);
    
    return this.menu
      .filter((m) => m.vendorId === vendorId || m.vendorId === 'vendor-demo')
      .map((m) => ({ ...m }));
  }

  async fetchItemStock(_vendorId: string): Promise<Record<string, ItemStock>> {
    await delay(80);
    
    // Shallow clone
    return Object.fromEntries(
      Object.entries(this.stock).map(([k, v]) => [k, { ...v }])
    );
  }

  // --- Writes ---

  async changeOrderStatus(
    vendorId: string,
    orderId: string,
    newStatus: string,
    _clientTxnId?: string
  ): Promise<Order> {
    await delay();

    // Simulate network failure occasionally
    if (shouldFail()) {
      const e: any = new Error('Simulated network error');
      e.code = 'DEMO_RANDOM_FAIL';
      throw e;
    }

    const idx = this.orders.findIndex((o) => o.id === orderId && o.vendorId === vendorId);
    if (idx === -1) {
      throw new Error('Order not found');
    }

    const current = this.orders[idx];
    const target = newStatus as OrderStatus;

    // Validate status transition
    if (!ALLOWED[current.status].includes(target)) {
      const e: any = new Error(`Invalid transition: ${current.status} → ${target}`);
      e.code = 'INVALID_TRANSITION';
      throw e;
    }

    // Update order with version bump
    const updated: Order = {
      ...current,
      status: target,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
    };

    this.orders[idx] = updated;
    this.emit(vendorId);

    return {
      ...updated,
      items: updated.items.map((i) => ({ ...i })),
    };
  }

  async toggleItemStock(
    itemId: string,
    inStock: boolean,
    until?: string | null
  ): Promise<void> {
    await delay(120);
    
    const row = this.stock[itemId];
    if (!row) return;

    this.stock[itemId] = {
      ...row,
      inStock,
      outOfStockUntil: until ?? null,
      updatedAt: new Date().toISOString(),
    };
  }

  async createOrder(
    vendorId: string,
    payload: {
      items: { itemId: string; qty: number }[];
      total: number;
      idempotencyKey?: string;
    }
  ): Promise<Order> {
    await delay();

    // Simulate network failure occasionally
    if (shouldFail()) {
      const e: any = new Error('Simulated create error');
      e.code = 'DEMO_RANDOM_FAIL';
      throw e;
    }

    // Check for idempotency
    if (payload.idempotencyKey) {
      const existing = this.orders.find(
        (o) => (o as any).idempotencyKey === payload.idempotencyKey
      );
      if (existing) {
        return {
          ...existing,
          items: existing.items.map((i) => ({ ...i })),
        };
      }
    }

    const now = new Date().toISOString();
    const id = `demo-${Math.random().toString(36).slice(2, 8)}`;

    const items = payload.items.map((it) => {
      const m = this.menu.find((x) => x.id === it.itemId);
      return {
        itemId: it.itemId,
        qty: it.qty,
        price: m?.price ?? 0,
        name: m?.name,
      };
    });

    const order: Order = {
      id,
      vendorId,
      total: payload.total,
      status: 'NEW',
      createdAt: now,
      updatedAt: now,
      version: 1,
      items,
      itemsCount: payload.items.reduce((sum, item) => sum + item.qty, 0),
      orderNumber: String(this.orders.length + 1),
    };

    // Store idempotency key if provided
    if (payload.idempotencyKey) {
      (order as any).idempotencyKey = payload.idempotencyKey;
    }

    this.orders.unshift(order);
    this.emit(vendorId);

    return {
      ...order,
      items: order.items.map((i) => ({ ...i })),
    };
  }

  // Public getters for backward compatibility with legacy functions
  /**
   * @deprecated Use fetchMenuItems() instead
   * Get menu items synchronously (for backward compatibility)
   */
  getMenuItemsSync(): MenuItem[] {
    return [...this.menu];
  }

  /**
   * @deprecated Use fetchOrders() instead
   * Get orders synchronously (for backward compatibility)
   */
  getOrdersSync(): Order[] {
    return this.orders.map((o) => ({
      ...o,
      items: o.items.map((i) => ({ ...i })),
    }));
  }
}

// Create and export a singleton instance
export const demoOrderRepository = new DemoOrderRepository();

// Legacy function exports for backward compatibility
// Note: These are now async but kept for compatibility during migration
// TODO: Remove these once all components use OrderProvider
import type { OrderItem } from '@/types';

export type DemoOrder = Order;
export type DemoOrderItem = OrderItem;
export type DemoMenuItem = MenuItem;

// Synchronous versions for backward compatibility
// These bypass async delays for immediate UI rendering during migration
export const getMenuItems = (): MenuItem[] => {
  return demoOrderRepository.getMenuItemsSync();
};

export const getOrders = (): Order[] => {
  return demoOrderRepository.getOrdersSync();
};

export const getOrdersByStatus = (status: OrderStatus): Order[] => {
  return getOrders().filter(order => order.status === status);
};

export const getOrderById = (id: string): Order | undefined => {
  return getOrders().find(order => order.id === id);
};
