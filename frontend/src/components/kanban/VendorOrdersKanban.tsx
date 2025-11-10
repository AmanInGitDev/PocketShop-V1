/**
 * VendorOrdersKanban - Drag-and-drop Kanban board for vendor orders
 * 
 * Features:
 * - Three columns: NEW, IN_PROGRESS, READY
 * - Drag-and-drop between columns with optimistic updates
 * - Quick action buttons (Accept/Start/Ready/View)
 * - Responsive design
 * - Keyboard accessible
 * - Real-time updates via OrderProvider
 */

import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Clock, AlertCircle, Info } from 'lucide-react';
import { useOrderContext } from '@/context/OrderProvider';
import type { Order, OrderStatus } from '@/types';
import { OrderCard } from './OrderCard';

type VendorOrdersKanbanProps = {
  vendorId?: string; // Optional - OrderProvider already has vendorId
};

type ColumnId = 'NEW' | 'IN_PROGRESS' | 'READY';

interface ColumnConfig {
  id: ColumnId;
  title: string;
  status: OrderStatus;
  borderColor: string;
  titleColor: string;
  bgColor: string;
  nextStatus?: OrderStatus;
  actionLabel?: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'NEW',
    title: 'New Orders',
    status: 'NEW',
    borderColor: 'border-orange-400',
    titleColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    nextStatus: 'IN_PROGRESS',
    actionLabel: 'Accept',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    status: 'IN_PROGRESS',
    borderColor: 'border-blue-400',
    titleColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    nextStatus: 'READY',
    actionLabel: 'Mark Ready',
  },
  {
    id: 'READY',
    title: 'Ready',
    status: 'READY',
    borderColor: 'border-green-400',
    titleColor: 'text-green-600',
    bgColor: 'bg-green-50',
    nextStatus: 'COMPLETED',
    actionLabel: 'Complete',
  },
];


/**
 * Kanban Column Component (Droppable)
 */
interface KanbanColumnProps {
  column: ColumnConfig;
  orders: Order[];
  onViewMore: (orderId: string) => void;
  onQuickAction: (orderId: string, newStatus: OrderStatus) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  orders,
  onViewMore,
  onQuickAction,
}) => {
  const orderIds = useMemo(() => orders.map((o) => o.id), [orders]);
  
  // Make column droppable
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <section
      ref={setNodeRef}
      className={`${column.bgColor} rounded-lg p-4 min-h-[500px] flex flex-col transition-colors ${
        isOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      aria-label={`${column.title} column with ${orders.length} orders`}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
        <h3 className={`text-sm font-bold ${column.titleColor}`}>{column.title}</h3>
        <span
          className="bg-white text-gray-700 rounded-full text-xs font-semibold px-2.5 py-0.5 shadow-sm"
          aria-label={`${orders.length} ${column.title.toLowerCase()}`}
        >
          {orders.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
          {orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                borderColor={column.borderColor}
                nextStatus={column.nextStatus}
                actionLabel={column.actionLabel}
                onQuickAction={onQuickAction}
                onViewMore={onViewMore}
              />
            ))
          ) : (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              role="status"
              aria-live="polite"
            >
              <Info className="w-12 h-12 text-gray-300 mb-3" aria-hidden="true" />
              <p className="text-sm text-gray-500 font-medium">No {column.title.toLowerCase()}</p>
            </div>
          )}
        </SortableContext>
      </div>
    </section>
  );
};

/**
 * Main VendorOrdersKanban Component
 */
export const VendorOrdersKanban: React.FC<VendorOrdersKanbanProps> = ({ vendorId: _vendorId }) => {
  const { orders, loading, error, changeOrderStatus, openOrder } = useOrderContext();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group orders by status
  const ordersByColumn = useMemo(() => {
    const grouped: Record<ColumnId, Order[]> = {
      NEW: [],
      IN_PROGRESS: [],
      READY: [],
    };

    orders.forEach((order) => {
      if (order.status === 'NEW') {
        grouped.NEW.push(order);
      } else if (order.status === 'IN_PROGRESS') {
        grouped.IN_PROGRESS.push(order);
      } else if (order.status === 'READY') {
        grouped.READY.push(order);
      }
    });

    // Sort by creation time (newest first)
    Object.keys(grouped).forEach((key) => {
      grouped[key as ColumnId].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });

    return grouped;
  }, [orders]);

  // Get active order being dragged
  const activeOrder = useMemo(() => {
    if (!activeId) return null;
    return orders.find((o) => o.id === activeId) || null;
  }, [activeId, orders]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const orderId = active.id as string;
    const targetColumnId = over.id as ColumnId | string;

    // Check if dropping on a column (not another order)
    const targetColumn = COLUMNS.find((col) => col.id === targetColumnId);
    if (!targetColumn) {
      // Might be dropping on another order in a column - find which column
      const targetOrder = orders.find((o) => o.id === targetColumnId);
      if (targetOrder) {
        const targetCol = COLUMNS.find((col) => col.status === targetOrder.status);
        if (targetCol && targetCol.id) {
          return handleStatusChange(orderId, targetCol.status);
        }
      }
      return;
    }

    // Find current order
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // If dropping in the same column, do nothing
    if (order.status === targetColumn.status) return;

    await handleStatusChange(orderId, targetColumn.status);
  };

  // Helper to handle status change with error handling
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await changeOrderStatus(orderId, newStatus);
    } catch (err) {
      // Error handling is done in OrderProvider (rollback happens automatically)
      console.error('Failed to change order status:', err);
    }
  };

  // Handle drag over (for visual feedback)
  const handleDragOver = (_event: DragOverEvent) => {
    // Visual feedback is handled by CSS classes
  };

  // Handle quick action button click
  const handleQuickAction = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await changeOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('Failed to change order status:', err);
    }
  };

  // Handle view more
  const handleViewMore = (orderId: string) => {
    openOrder(orderId);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">Error loading orders</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              orders={ordersByColumn[column.id]}
              onViewMore={handleViewMore}
              onQuickAction={handleQuickAction}
            />
          ))}
        </div>

        {/* Drag Overlay - Shows the card being dragged */}
        <DragOverlay>
          {activeOrder ? (
            <div className="bg-white rounded-md shadow-lg border-l-4 border-blue-400 p-4 opacity-95 rotate-2">
              <div className="text-base font-bold text-gray-900 mb-1">
                #{activeOrder.orderNumber ?? activeOrder.id.slice(-6).toUpperCase()} -{' '}
                {activeOrder.customerName ?? 'Anonymous'}
              </div>
              <div className="text-sm text-gray-600">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(activeOrder.total)}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default VendorOrdersKanban;

