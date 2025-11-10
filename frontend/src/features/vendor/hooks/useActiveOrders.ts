import { useState, useEffect, useCallback } from 'react';

export interface ActiveOrder {
  orderId: string;
  orderNumber: string;
  vendorId: string;
  vendorName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
}

const ACTIVE_ORDERS_KEY = 'pocketshop_active_orders';
const MAX_ACTIVE_ORDERS = 5; // Keep last 5 orders

export function useActiveOrders(vendorId?: string) {
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);

  // Load active orders from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_ORDERS_KEY);
      if (stored) {
        const allOrders: ActiveOrder[] = JSON.parse(stored);
        // Filter by vendorId if provided
        const filtered = vendorId
          ? allOrders.filter(order => order.vendorId === vendorId)
          : allOrders;
        setActiveOrders(filtered);
      }
    } catch (error) {
      console.error('Error loading active orders:', error);
    }
  }, [vendorId]);

  // Add a new order to active orders
  const addActiveOrder = useCallback((order: ActiveOrder) => {
    try {
      const stored = localStorage.getItem(ACTIVE_ORDERS_KEY);
      const existingOrders: ActiveOrder[] = stored ? JSON.parse(stored) : [];
      
      // Check if order already exists
      const orderExists = existingOrders.some(o => o.orderId === order.orderId);
      if (orderExists) {
        // Update existing order
        const updatedOrders = existingOrders.map(o =>
          o.orderId === order.orderId ? order : o
        );
        localStorage.setItem(ACTIVE_ORDERS_KEY, JSON.stringify(updatedOrders));
        setActiveOrders(vendorId 
          ? updatedOrders.filter(o => o.vendorId === vendorId)
          : updatedOrders
        );
      } else {
        // Add new order (keep only last MAX_ACTIVE_ORDERS)
        const newOrders = [order, ...existingOrders].slice(0, MAX_ACTIVE_ORDERS);
        localStorage.setItem(ACTIVE_ORDERS_KEY, JSON.stringify(newOrders));
        setActiveOrders(vendorId 
          ? newOrders.filter(o => o.vendorId === vendorId)
          : newOrders
        );
      }
    } catch (error) {
      console.error('Error saving active order:', error);
    }
  }, [vendorId]);

  // Update order status
  const updateOrderStatus = useCallback((orderId: string, status: string, paymentStatus?: string) => {
    try {
      const stored = localStorage.getItem(ACTIVE_ORDERS_KEY);
      if (!stored) return;

      const orders: ActiveOrder[] = JSON.parse(stored);
      const updatedOrders = orders.map(order => {
        if (order.orderId === orderId) {
          return {
            ...order,
            status,
            ...(paymentStatus && { paymentStatus }),
          };
        }
        return order;
      });

      localStorage.setItem(ACTIVE_ORDERS_KEY, JSON.stringify(updatedOrders));
      setActiveOrders(vendorId 
        ? updatedOrders.filter(o => o.vendorId === vendorId)
        : updatedOrders
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }, [vendorId]);

  // Remove an order from active tracking
  const removeActiveOrder = useCallback((orderId: string) => {
    try {
      const stored = localStorage.getItem(ACTIVE_ORDERS_KEY);
      if (!stored) return;

      const orders: ActiveOrder[] = JSON.parse(stored);
      const filteredOrders = orders.filter(order => order.orderId !== orderId);
      
      localStorage.setItem(ACTIVE_ORDERS_KEY, JSON.stringify(filteredOrders));
      setActiveOrders(vendorId 
        ? filteredOrders.filter(o => o.vendorId === vendorId)
        : filteredOrders
      );
    } catch (error) {
      console.error('Error removing active order:', error);
    }
  }, [vendorId]);

  // Clear all active orders
  const clearActiveOrders = useCallback(() => {
    try {
      if (vendorId) {
        // Only clear orders for this vendor
        const stored = localStorage.getItem(ACTIVE_ORDERS_KEY);
        if (stored) {
          const allOrders: ActiveOrder[] = JSON.parse(stored);
          const otherOrders = allOrders.filter(o => o.vendorId !== vendorId);
          localStorage.setItem(ACTIVE_ORDERS_KEY, JSON.stringify(otherOrders));
          setActiveOrders([]);
        }
      } else {
        // Clear all orders
        localStorage.removeItem(ACTIVE_ORDERS_KEY);
        setActiveOrders([]);
      }
    } catch (error) {
      console.error('Error clearing active orders:', error);
    }
  }, [vendorId]);

  return {
    activeOrders,
    addActiveOrder,
    updateOrderStatus,
    removeActiveOrder,
    clearActiveOrders,
  };
}

