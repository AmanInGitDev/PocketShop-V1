/**
 * Vendor Orders Kanban Page
 * 
 * Kanban-style order management interface with three columns:
 * - New Orders
 * - In Progress
 * - Ready
 * 
 * Uses VendorOrdersKanban component for drag-and-drop functionality.
 */

import React, { useState } from 'react';
import { Inbox } from 'lucide-react';
import VendorOrdersKanban from '@/components/kanban/VendorOrdersKanban';
import OrderDetailPanel from '@/components/kanban/OrderDetailPanel';
import { useOrderContext } from '@/context/OrderProvider';
import type { OrderStatus } from '@/types';

const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const { selectedOrder, openOrder, changeOrderStatus } = useOrderContext();

  const handleClosePanel = () => {
    openOrder(null);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await changeOrderStatus(orderId, newStatus);
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Orders</h1>
      </div>

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
            aria-label="Live orders tab"
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
            aria-label="Orders history tab"
          >
            Orders History
          </button>
        </div>
      </div>

      {/* Kanban Board or History */}
      {activeTab === 'live' ? (
        <VendorOrdersKanban />
      ) : (
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200 shadow-sm">
          <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600 font-medium">Orders history will be displayed here</p>
        </div>
      )}

      {/* Order Detail Panel */}
      <OrderDetailPanel
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={handleClosePanel}
        onChangeStatus={handleStatusChange}
      />
    </div>
  );
};

export default Orders;
