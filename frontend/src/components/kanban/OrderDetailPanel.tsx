/**
 * OrderDetailPanel - Slide-over panel for order details
 * 
 * Features:
 * - Full order information
 * - Items table with quantities and prices
 * - Totals breakdown
 * - Event log (status change history)
 * - Action buttons mapped by order status
 * - Close button and backdrop
 */

import React, { useMemo, useEffect } from 'react';
import {
  X,
  Clock,
  User,
  CreditCard,
  Package,
  CheckCircle,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  AlertCircle,
} from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

export interface OrderDetailPanelProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onChangeStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

/**
 * Event log entry interface
 */
interface EventLogEntry {
  id: string;
  timestamp: string;
  event: string;
  description: string;
  status?: OrderStatus;
}

/**
 * Generate event log from order data
 */
const generateEventLog = (order: Order): EventLogEntry[] => {
  const events: EventLogEntry[] = [];

  // Order created
  events.push({
    id: '1',
    timestamp: order.createdAt,
    event: 'Order Created',
    description: `Order #${order.orderNumber ?? order.id.slice(-6).toUpperCase()} was created`,
    status: 'NEW',
  });

  // Status changes based on current status
  if (order.status !== 'NEW') {
    events.push({
      id: '2',
      timestamp: order.updatedAt,
      event: 'Status Changed',
      description: `Order status changed to ${order.status.replace('_', ' ')}`,
      status: order.status,
    });
  }

  // Payment status
  if (order.paymentStatus === 'PAID') {
    events.push({
      id: '3',
      timestamp: order.updatedAt,
      event: 'Payment Received',
      description: `Payment of ₹${order.total} received via ${order.paymentMethod ?? 'Unknown'}`,
    });
  }

  // Sort by timestamp (newest first)
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

/**
 * Get status-based action buttons
 */
const getStatusActions = (status: OrderStatus): Array<{ label: string; status: OrderStatus; color: string }> => {
  switch (status) {
    case 'NEW':
      return [
        { label: 'Accept Order', status: 'IN_PROGRESS', color: 'bg-blue-600 hover:bg-blue-700' },
        { label: 'Cancel Order', status: 'CANCELLED', color: 'bg-red-600 hover:bg-red-700' },
      ];
    case 'IN_PROGRESS':
      return [
        { label: 'Mark as Ready', status: 'READY', color: 'bg-green-600 hover:bg-green-700' },
        { label: 'Cancel Order', status: 'CANCELLED', color: 'bg-red-600 hover:bg-red-700' },
      ];
    case 'READY':
      return [
        { label: 'Complete Order', status: 'COMPLETED', color: 'bg-green-600 hover:bg-green-700' },
      ];
    case 'COMPLETED':
      return [];
    case 'CANCELLED':
      return [];
    default:
      return [];
  }
};

/**
 * Format date/time
 */
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format time ago
 */
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const orderDate = new Date(dateString);
  const diffMs = now.getTime() - orderDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

/**
 * Get status badge color
 */
const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'NEW':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'READY':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'COMPLETED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Get payment method display
 */
const getPaymentMethodDisplay = (method?: Order['paymentMethod']) => {
  if (!method) return 'Unknown';
  switch (method) {
    case 'GOOGLE_PAY':
      return 'Google Pay';
    case 'PAYTM':
      return 'Paytm';
    case 'PHONEPE':
      return 'PhonePe';
    case 'CASH':
      return 'Cash';
    case 'CARD':
      return 'Card';
    default:
      return method;
  }
};

/**
 * Get order type icon
 */
const getOrderTypeIcon = (type?: Order['orderType']) => {
  if (type === 'DINE_IN') {
    return <UtensilsCrossed className="w-5 h-5 text-red-600" />;
  } else if (type === 'TAKEAWAY') {
    return <ShoppingBag className="w-5 h-5 text-gray-900" />;
  } else if (type === 'DELIVERY') {
    return <Truck className="w-5 h-5 text-blue-600" />;
  }
  return <Package className="w-5 h-5 text-gray-600" />;
};

/**
 * OrderDetailPanel Component
 */
export const OrderDetailPanel: React.FC<OrderDetailPanelProps> = ({
  order,
  isOpen,
  onClose,
  onChangeStatus,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!order) return null;

  const eventLog = useMemo(() => generateEventLog(order), [order]);
  const statusActions = useMemo(() => getStatusActions(order.status), [order.status]);
  const orderNumber = order.orderNumber ?? order.id.slice(-6).toUpperCase();
  const customerName = order.customerName ?? 'Anonymous';

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(order.total);

  // Calculate subtotal from items
  const subtotal = useMemo(() => {
    return order.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  }, [order.items]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsProcessing(true);
    try {
      await onChangeStatus(order.id, newStatus);
      // Close panel after successful status change (optional)
      // onClose();
    } catch (error) {
      console.error('Failed to change status:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-over Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 id="order-detail-title" className="text-xl font-bold text-gray-900">
                Order #{orderNumber}
              </h2>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close panel"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Order Info */}
            <div className="space-y-6">
              {/* Customer & Order Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="text-base font-medium text-gray-900">{customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getOrderTypeIcon(order.orderType)}
                  <div>
                    <p className="text-sm text-gray-500">Order Type</p>
                    <p className="text-base font-medium text-gray-900">
                      {order.orderType?.replace('_', ' ') ?? 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="text-base font-medium text-gray-900">
                      {getPaymentMethodDisplay(order.paymentMethod)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {order.paymentStatus === 'PAID' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className="text-base font-medium text-gray-900">
                      {order.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-base font-medium text-gray-900">{formatDateTime(order.createdAt)}</p>
                    <p className="text-xs text-gray-400">{getTimeAgo(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-base font-medium text-gray-900">{formatDateTime(order.updatedAt)}</p>
                    <p className="text-xs text-gray-400">{getTimeAgo(order.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item, index) => (
                        <tr key={item.id ?? index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.name || 'Item'}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 text-right">{item.qty}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 text-right">
                            ₹{item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            ₹{(item.qty * item.price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formattedTotal}</span>
                </div>
              </div>

              {/* Event Log */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Log</h3>
                <div className="space-y-3">
                  {eventLog.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{event.event}</p>
                        <p className="text-sm text-gray-500">{event.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDateTime(event.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Action Buttons */}
          {statusActions.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                {statusActions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => handleStatusChange(action.status)}
                    disabled={isProcessing}
                    className={`flex-1 ${action.color} text-white text-sm font-medium px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isProcessing ? 'Processing...' : action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderDetailPanel;

