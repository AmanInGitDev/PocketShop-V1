import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/features/vendor/hooks/useOrders";
import { OrderCard } from "@/components/orders/OrderCard";
import type { Database } from "@/features/common/types/database";
import { Package } from "lucide-react";

type OrderStatus = Database["public"]["Enums"]["order_status"];

export default function Orders() {
  const { data: orders, isLoading } = useOrders();

  const filterOrdersByStatus = (status?: OrderStatus) => {
    if (!orders) return [];
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  };

  const getOrderCount = (status?: OrderStatus) => {
    return filterOrdersByStatus(status).length;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  const OrderList = ({ status }: { status?: OrderStatus }) => {
    const filteredOrders = filterOrdersByStatus(status);

    if (filteredOrders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No {status ? status : ''} orders found
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            Manage and track all your customer orders
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              All Orders
              {orders && orders.length > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {getOrderCount()}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {getOrderCount('pending') > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {getOrderCount('pending')}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="processing">
              Processing
              {getOrderCount('processing') > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {getOrderCount('processing')}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ready">
              Ready
              {getOrderCount('ready') > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {getOrderCount('ready')}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              {getOrderCount('completed') > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {getOrderCount('completed')}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled
              {getOrderCount('cancelled') > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {getOrderCount('cancelled')}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <OrderList />
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            <OrderList status="pending" />
          </TabsContent>

          <TabsContent value="processing" className="space-y-4">
            <OrderList status="processing" />
          </TabsContent>

          <TabsContent value="ready" className="space-y-4">
            <OrderList status="ready" />
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <OrderList status="completed" />
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            <OrderList status="cancelled" />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
