/**
 * Vendor Orders Kanban Page
 * 
 * Kanban-style order management interface with three columns:
 * - New Orders
 * - In Progress
 * - Ready
 */

import React, { useState, useMemo } from 'react';
import { 
  getOrders, 
  getOrdersByStatus,
  type DemoOrder 
} from '@/features/vendor/services/demoOrderRepository';
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  Info,
  Clock,
  Inbox
} from 'lucide-react';

const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');

  // Load demo orders
  const allOrders = useMemo(() => getOrders(), []);
  
  // Filter orders by status
  const newOrders = useMemo(() => getOrdersByStatus('NEW'), []);
  const inProgressOrders = useMemo(() => getOrdersByStatus('IN_PROGRESS'), []);
  const readyOrders = useMemo(() => getOrdersByStatus('READY'), []);

  const filteredNewOrders = newOrders;
  const filteredInProgressOrders = inProgressOrders;
  const filteredReadyOrders = readyOrders;

  // Calculate time ago
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const orderDate = new Date(dateString);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    return `${diffMins} min ago`;
  };

  // Format time (HH.MM format)
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}.${minutes}`;
  };

  // Get payment method icon/name
  const getPaymentMethodDisplay = (method: DemoOrder['paymentMethod']) => {
    switch (method) {
      case 'GOOGLE_PAY':
        return { name: 'Google Pay', color: 'text-blue-600' };
      case 'PAYTM':
        return { name: 'Paytm', color: 'text-blue-600' };
      case 'PHONEPE':
        return { name: 'PhonePe', color: 'text-blue-600' };
      case 'CASH':
        return { name: 'Cash', color: 'text-green-600' };
      case 'CARD':
        return { name: 'Card', color: 'text-blue-600' };
      default:
        return { name: method, color: 'text-gray-600' };
    }
  };

  // Get order type icon
  const getOrderTypeIcon = (type: DemoOrder['orderType']) => {
    if (type === 'DINE_IN') {
      return (
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <UtensilsCrossed className="w-4 h-4 text-red-600" />
        </div>
      );
    } else if (type === 'TAKE_AWAY') {
      return (
        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-4 h-4 text-white" />
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Info className="w-4 h-4 text-blue-600" />
        </div>
      );
    }
  };

  // Order Card Component
  const OrderCard: React.FC<{ order: DemoOrder; statusColor: string }> = ({ order, statusColor }) => {
    const paymentMethod = getPaymentMethodDisplay(order.paymentMethod);
    const timeAgo = getTimeAgo(order.createdAt);
    const time = formatTime(order.createdAt);

    return (
      <article className={`bg-white rounded-md shadow-md border-l-4 ${statusColor} p-4 mb-4 hover:shadow-lg transition-shadow`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            {getOrderTypeIcon(order.orderType)}
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-gray-900 mb-1">
                {order.orderNumber} - {order.customerName}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <span>{order.itemsCount} items</span>
                  <span>•</span>
                  <span className={paymentMethod.color}>Payment: {paymentMethod.name}</span>
                </div>
                {order.paymentStatus === 'PAID' && (
                  <div className="flex items-center gap-1 text-green-600 font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Paid
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-lg font-bold text-gray-900">
              ₹{order.total}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{time} • {timeAgo}</span>
          </div>
          <button 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            View More
          </button>
        </div>
      </article>
    );
  };

  // Kanban Column Component
  const KanbanColumn: React.FC<{
    title: string;
    count: number;
    orders: DemoOrder[];
    borderColor: string;
    titleColor: string;
  }> = ({ title, count, orders, borderColor, titleColor }) => {
    return (
      <section className="bg-gray-100 rounded-lg p-4 min-h-[500px]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
          <h3 className={`text-sm font-bold ${titleColor}`}>{title}</h3>
          <span className="bg-gray-200 text-gray-700 rounded-full text-xs font-semibold px-2.5 py-0.5">
            {count}
          </span>
        </div>
        <div className="space-y-0">
          {orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard key={order.id} order={order} statusColor={borderColor} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Inbox className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 font-medium">No {title.toLowerCase()}</p>
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Orders</h1>
      </div>

      {/* Main Content */}
      <div>
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex items-end gap-6 border-b border-gray-300 pb-3">
              <button
                onClick={() => setActiveTab('live')}
                className={`text-sm font-semibold pb-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t ${
                  activeTab === 'live'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Live Orders
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`text-sm font-semibold pb-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t ${
                  activeTab === 'history'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Orders History
              </button>
            </div>
          </div>

          {/* Kanban Board */}
          {activeTab === 'live' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KanbanColumn
                title="New Orders"
                count={filteredNewOrders.length}
                orders={filteredNewOrders}
                borderColor="border-orange-400"
                titleColor="text-orange-600"
              />
              <KanbanColumn
                title="In Progress"
                count={filteredInProgressOrders.length}
                orders={filteredInProgressOrders}
                borderColor="border-blue-400"
                titleColor="text-blue-600"
              />
              <KanbanColumn
                title="Ready"
                count={filteredReadyOrders.length}
                orders={filteredReadyOrders}
                borderColor="border-green-400"
                titleColor="text-green-600"
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200 shadow-sm">
              <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Orders history will be displayed here</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default Orders;
