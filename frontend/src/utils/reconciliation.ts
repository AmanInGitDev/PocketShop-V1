/**
 * Reconciliation utilities for merging local (optimistic) and remote (canonical) order state.
 */

import type { Order } from '@/types';

/**
 * Merge local (optimistic) order with remote canonical order.
 * 
 * Rules:
 *  - If remote.version > local.version -> use remote (server wins)
 *  - Otherwise prefer remote for most fields but keep local optimistic flags if needed
 * 
 * @param local - Local order state (possibly optimistic)
 * @param remote - Remote order state (canonical from server)
 * @returns Merged order with server state taking precedence when versions differ
 */
export function reconcileOrder(local: Order, remote: Order): Order {
  // If remote is newer, use it completely
  if (remote.version > local.version) {
    return remote;
  }
  
  // If local is newer or same version, merge fields safely
  // In most cases, we want to prefer remote for data integrity
  // but this allows for client-side optimizations if needed
  return {
    ...remote,
    // Keep any client-side transient fields if you need them (none by default)
    // You can extend this to preserve specific optimistic flags here
  };
}

/**
 * Extract user-friendly error message from various error formats.
 * 
 * @param err - Error object, string, or unknown type
 * @returns Human-readable error message
 */
export function extractErrorMessage(err: unknown): string {
  if (!err) return 'Unknown error';
  
  if (err instanceof Error) {
    return err.message;
  }
  
  if (typeof err === 'string') {
    return err;
  }
  
  if (typeof err === 'object' && err !== null) {
    const errorObj = err as Record<string, any>;
    if (errorObj.message) {
      return String(errorObj.message);
    }
    if (errorObj.error) {
      return String(errorObj.error);
    }
  }
  
  return 'Server error';
}

