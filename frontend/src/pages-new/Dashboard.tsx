import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/ui/metric-card";
import { DollarSign, ShoppingCart, Package, AlertCircle } from "lucide-react";
import { useVendor } from "@/features/vendor/hooks/useVendor";
import { useOrders } from "@/features/vendor/hooks/useOrders";
import { useProducts } from "@/features/vendor/hooks/useProducts";
import { usePaymentStats } from "@/features/vendor/hooks/usePayments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: vendor, isLoading: vendorLoading } = useVendor();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: paymentStats, isLoading: paymentsLoading } = usePaymentStats();

  // Calculate metrics - use payment stats for accurate revenue
  const totalRevenue = paymentStats?.totalRevenue || 0;
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;
  const lowStockProducts = products?.filter(
    (p) => p.stock_quantity <= p.low_stock_threshold
  ).length || 0;

  const recentOrders = orders?.slice(0, 5) || [];
  const pendingOrders = orders?.filter((o) => o.status === 'pending').length || 0;

  if (vendorLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {vendor?.business_name}! Here's your business overview.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="h-4 w-4" />}
            description={`From completed payments`}
            isLoading={paymentsLoading}
          />
          <MetricCard
            title="Total Orders"
            value={totalOrders}
            icon={<ShoppingCart className="h-4 w-4" />}
            description={`${pendingOrders} pending`}
            isLoading={ordersLoading}
          />
          <MetricCard
            title="Products"
            value={totalProducts}
            icon={<Package className="h-4 w-4" />}
            description={lowStockProducts > 0 ? `${lowStockProducts} low stock` : 'All stocked'}
            isLoading={productsLoading}
          />
          <MetricCard
            title="Low Stock Alerts"
            value={lowStockProducts}
            icon={<AlertCircle className="h-4 w-4" />}
            description={lowStockProducts > 0 ? 'Needs attention' : 'All good'}
            isLoading={productsLoading}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from your storefront</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_name || 'Guest'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{Number(order.total_amount).toLocaleString()}</p>
                        <Badge variant={
                          order.status === 'completed' ? 'default' :
                          order.status === 'pending' ? 'secondary' :
                          order.status === 'cancelled' ? 'destructive' : 'outline'
                        }>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No orders yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
              <CardDescription>Products that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : lowStockProducts > 0 ? (
                <div className="space-y-4">
                  {products
                    ?.filter((p) => p.stock_quantity <= p.low_stock_threshold)
                    .slice(0, 5)
                    .map((product) => (
                      <div key={product.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">₹{Number(product.price).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">
                            {product.stock_quantity} left
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>All products are well stocked</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
