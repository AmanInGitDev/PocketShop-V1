/**
 * Vendor Orders Page
 *
 * Kanban-style order management interface with summary stats.
 * UI and stats are adapted from Migration_Data/src/pages/Orders.tsx
 * but wired to the shared OrderProvider + VendorOrdersKanban.
 */

import React, { useMemo } from 'react';
import { Clock, Package, TrendingUp, DollarSign } from 'lucide-react';
import VendorOrdersKanban from '@/components/kanban/VendorOrdersKanban';
import OrderDetailPanel from '@/components/kanban/OrderDetailPanel';
import { useOrderContext } from '@/context/OrderProvider';
import type { Order, OrderStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const Orders: React.FC = () => {
  const { orders, selectedOrder, openOrder, changeOrderStatus } = useOrderContext();

  const stats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        total: 0,
        activeOrders: 0,
        completed: 0,
        cancelled: 0,
        totalRevenue: 0,
      };
    }

    const isActive = (status: OrderStatus) =>
      status === 'NEW' || status === 'IN_PROGRESS' || status === 'READY';

    const completed = orders.filter((o) => o.status === 'COMPLETED').length;
    const cancelled = orders.filter((o) => o.status === 'CANCELLED').length;

    return {
      total: orders.length,
      activeOrders: orders.filter((o) => isActive(o.status)).length,
      completed,
      cancelled,
      totalRevenue: orders
        .filter((o) => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + (o.total || 0), 0),
    };
  }, [orders]);

  const completedOrders = useMemo(
    () => (orders || []).filter((o) => o.status === 'COMPLETED'),
    [orders],
  );
  const cancelledOrders = useMemo(
    () => (orders || []).filter((o) => o.status === 'CANCELLED'),
    [orders],
  );

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const handleClosePanel = () => {
    openOrder(null);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await changeOrderStatus(orderId, newStatus);
  };

  // NOTE: History view approximates the original Completed/Cancelled list UI from the
  // previous repo. Once the entire migration is stable we can refine this section
  // for exact visual parity (icons/layout) while keeping the same data wiring.
  const renderHistoryItem = (order: Order) => {
    const idLabel = order.orderNumber ?? order.id;
    const itemsCount = order.itemsCount ?? order.items.length;

    return (
      <div
        key={order.id}
        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">#{idLabel}</span>
            {order.paymentStatus && (
              <Badge
                variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {order.paymentStatus === 'PAID' ? 'Paid' : 'Unpaid'}
              </Badge>
            )}
          </div>
          {order.customerName && (
            <p className="text-sm text-muted-foreground truncate">{order.customerName}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
          </p>
        </div>
        <div className="text-right ml-4 space-y-1">
          <p className="font-semibold">
            ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-muted-foreground">
            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Order Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Drag and drop orders to update their status
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Orders
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Live orders in New, In Progress, and Ready
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time orders</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {stats.completed} completed orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completed} completed, {stats.cancelled} cancelled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <VendorOrdersKanban />

      {/* Order History (Completed / Cancelled) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Order History</h3>
            <p className="text-sm text-muted-foreground">
              Review completed and cancelled orders
            </p>
          </div>
        </div>

        <Tabs defaultValue="completed" className="w-full">
          <TabsList>
            <TabsTrigger value="completed">
              Completed
              {completedOrders.length > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {completedOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled
              {cancelledOrders.length > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {cancelledOrders.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="completed" className="space-y-3 pt-4">
            {completedOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No completed orders yet.
              </p>
            ) : (
              completedOrders.map(renderHistoryItem)
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-3 pt-4">
            {cancelledOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No cancelled orders yet.
              </p>
            ) : (
              cancelledOrders.map(renderHistoryItem)
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Order Detail Panel (from OrderProvider context) */}
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
