/**
 * Vendor Dashboard Overview
 *
 * This page is adapted from Migration_Data/src/pages/Dashboard.tsx.
 * It keeps the richer metrics, charts, and quick actions from that version,
 * but is wired to the current frontend vendor hooks (useVendor, useOrders,
 * useProducts, usePaymentStats, useAnalytics) and the existing layout/routing.
 *
 * NOTE: Dark mode styling will be revisited after the full migration is complete.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  Sparkles,
  Clock,
  Zap,
  Plus,
  Eye,
  LayoutDashboard,
  Store,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useVendor } from '@/features/vendor/hooks/useVendor';
import { useOrders } from '@/features/vendor/hooks/useOrders';
import { useProducts } from '@/features/vendor/hooks/useProducts';
import { usePaymentStats } from '@/features/vendor/hooks/usePayments';
import { useAnalytics } from '@/features/vendor/hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
// NOTE: Dark mode toggle will be revisited after migration.
// For now we keep the dashboard always in the default theme.
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/context/AuthContext';

const CHART_COLORS = {
  revenue: 'hsl(221, 83%, 40%)',
  orders: 'hsl(142, 71%, 45%)',
  accent: 'hsl(142, 71%, 45%)',
  primary: 'hsl(221, 83%, 40%)',
  warning: 'hsl(48, 96%, 53%)',
  destructive: 'hsl(0, 84%, 60%)',
  processing: 'hsl(199, 89%, 48%)',
  ready: 'hsl(142, 71%, 45%)',
} as const;

const ORDER_STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: CHART_COLORS.warning,
    label: 'Pending',
    badgeVariant: 'secondary' as const,
  },
  processing: {
    icon: AlertCircle,
    color: CHART_COLORS.processing,
    label: 'Processing',
    badgeVariant: 'default' as const,
  },
  ready: {
    icon: CheckCircle2,
    color: CHART_COLORS.ready,
    label: 'Ready',
    badgeVariant: 'outline' as const,
  },
  completed: {
    icon: CheckCircle2,
    color: CHART_COLORS.orders,
    label: 'Completed',
    badgeVariant: 'default' as const,
  },
  cancelled: {
    icon: XCircle,
    color: CHART_COLORS.destructive,
    label: 'Cancelled',
    badgeVariant: 'destructive' as const,
  },
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function DashboardNew() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: vendor, isLoading: vendorLoading } = useVendor();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: paymentStats, isLoading: paymentsLoading } = usePaymentStats();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(30);

  const totalRevenue = paymentStats?.totalRevenue || 0;
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;
  const lowStockProducts =
    products?.filter((p: any) => p.stock_quantity <= p.low_stock_threshold).length || 0;

  const recentOrders = orders?.slice(0, 5) || [];
  const pendingOrders = orders?.filter((o: any) => o.status === 'pending').length || 0;
  const processingOrders = orders?.filter((o: any) => o.status === 'processing').length || 0;
  const readyOrders = orders?.filter((o: any) => o.status === 'ready').length || 0;
  const completedOrders = orders?.filter((o: any) => o.status === 'completed').length || 0;
  const cancelledOrders = orders?.filter((o: any) => o.status === 'cancelled').length || 0;

  const statusData = [
    { name: 'Pending', value: pendingOrders, color: CHART_COLORS.warning },
    { name: 'Processing', value: processingOrders, color: CHART_COLORS.processing },
    { name: 'Ready', value: readyOrders, color: CHART_COLORS.ready },
    { name: 'Completed', value: completedOrders, color: CHART_COLORS.orders },
    { name: 'Cancelled', value: cancelledOrders, color: CHART_COLORS.destructive },
  ].filter((item) => item.value > 0);

  const revenueGrowth = analytics?.weeklyComparison?.revenueGrowth || 0;
  const orderGrowth = analytics?.weeklyComparison?.orderGrowth || 0;
  const averageOrderValue = analytics?.averageOrderValue || 0;
  const topProducts = analytics?.topProducts?.slice(0, 5) || [];
  const salesChartData = analytics?.salesByDay?.slice(-7) || [];

  const vendorName = vendor?.business_name || user?.full_name || 'Vendor';

  if (vendorLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                {getGreeting()}, <span className="font-semibold text-foreground">{vendorName}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/vendor/dashboard/insights')}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/vendor/dashboard/inventory/add')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg bg-gradient-to-br from-primary/5 to-card">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-3xl font-bold mb-2">{formatCurrency(totalRevenue)}</div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge
                    variant={revenueGrowth >= 0 ? 'default' : 'destructive'}
                    className="gap-1"
                  >
                    {revenueGrowth >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(revenueGrowth).toFixed(1)}%
                  </Badge>
                  <span className="text-muted-foreground">vs last week</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="relative overflow-hidden border-2 border-accent/20 hover:border-accent/50 transition-all duration-300 group hover:shadow-lg bg-gradient-to-br from-accent/5 to-card">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-accent/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <ShoppingCart className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-3xl font-bold mb-2">{totalOrders}</div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge
                    variant={orderGrowth >= 0 ? 'default' : 'destructive'}
                    className="gap-1"
                  >
                    {orderGrowth >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(orderGrowth).toFixed(1)}%
                  </Badge>
                  <span className="text-muted-foreground">{pendingOrders} pending</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="relative overflow-hidden border-2 border-[hsl(48,96%,53%)]/20 hover:border-[hsl(48,96%,53%)]/50 transition-all duration-300 group hover:shadow-lg bg-gradient-to-br from-[hsl(48,96%,53%)]/5 to-card">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(48,96%,53%)]/10 via-[hsl(48,96%,53%)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[hsl(48,96%,53%)] via-[hsl(48,96%,53%)]/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Order Value
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-[hsl(48,96%,53%)]/10 flex items-center justify-center group-hover:bg-[hsl(48,96%,53%)]/20 transition-colors">
              <TrendingUp className="h-5 w-5" style={{ color: 'hsl(48, 96%, 53%)' }} />
            </div>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-3xl font-bold mb-2">{formatCurrency(averageOrderValue)}</div>
                <p className="text-xs text-muted-foreground">Per order</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stock Status */}
        <Card
          className={cn(
            'relative overflow-hidden border-2 transition-all duration-300 group hover:shadow-lg',
            lowStockProducts > 0
              ? 'hover:border-destructive/50 border-destructive/20 bg-gradient-to-br from-destructive/5 to-card'
              : 'hover:border-accent/50 border-accent/20 bg-gradient-to-br from-accent/5 to-card',
          )}
        >
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300',
              lowStockProducts > 0 ? 'from-destructive/10 via-destructive/5' : 'from-accent/10 via-accent/5',
            )}
          />
          <div
            className={cn(
              'absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r to-transparent opacity-50 group-hover:opacity-100 transition-opacity',
              lowStockProducts > 0 ? 'from-destructive via-destructive/50' : 'from-accent via-accent/50',
            )}
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Status</CardTitle>
            <div
              className={cn(
                'h-10 w-10 rounded-full flex items-center justify-center transition-colors',
                lowStockProducts > 0
                  ? 'bg-destructive/10 group-hover:bg-destructive/20'
                  : 'bg-accent/10 group-hover:bg-accent/20',
              )}
            >
              {lowStockProducts > 0 ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <Package className="h-5 w-5 text-accent" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-3xl font-bold mb-2">{lowStockProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {lowStockProducts > 0 ? 'Products need restocking' : 'All products stocked'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Overview */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Sales Overview
                </CardTitle>
                <CardDescription>Last 7 days revenue trend</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                7 Days
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : salesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.revenue} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.revenue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={CHART_COLORS.revenue}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No sales data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Order Status
            </CardTitle>
            <CardDescription>Distribution of orders</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : statusData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 pt-4 border-t">
                  {statusData.map((status, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="text-sm">{status.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{status.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No orders yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 hover:bg-primary/5 hover:border-primary/30 transition-all group"
              onClick={() => navigate('/vendor/dashboard/inventory/add')}
            >
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Add Product</p>
                <p className="text-xs text-muted-foreground">Create new product</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 hover:bg-accent/5 hover:border-accent/30 transition-all group"
              onClick={() => navigate('/vendor/dashboard/orders')}
            >
              <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <ShoppingCart className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">View Orders</p>
                <p className="text-xs text-muted-foreground">Manage all orders</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 hover:bg-[hsl(48,96%,53%)]/5 hover:border-[hsl(48,96%,53%)]/30 transition-all group"
              onClick={() => navigate('/vendor/dashboard/storefront')}
            >
              <div className="p-2 rounded-lg bg-[hsl(48,96%,53%)]/10 group-hover:bg-[hsl(48,96%,53%)]/20 transition-colors">
                <Store className="h-4 w-4" style={{ color: 'hsl(48, 96%, 53%)' }} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Storefront</p>
                <p className="text-xs text-muted-foreground">View your store</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 hover:bg-primary/5 hover:border-primary/30 transition-all group"
              onClick={() => navigate('/vendor/dashboard/insights')}
            >
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Analytics</p>
                <p className="text-xs text-muted-foreground">View insights</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Top Products & Recent Orders */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Top Products
                </CardTitle>
                <CardDescription>Best performing products this month</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/vendor/dashboard/insights')}
                className="gap-1"
              >
                View All
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product: any, index: number) => (
                  <div
                    key={product.id || index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.totalSold} sold • {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {product.category}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No product data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Latest orders from your storefront</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/vendor/dashboard/orders')}
                className="gap-1"
              >
                View All
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order: any) => {
                  const statusConfig =
                    ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG] ||
                    ORDER_STATUS_CONFIG.pending;
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div
                      key={order.id}
                      className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-all cursor-pointer hover:shadow-md hover:border-primary/20 relative overflow-hidden"
                      onClick={() => navigate(`/vendor/dashboard/orders/${order.id}`)}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-x-2 group-hover:translate-x-0">
                        <ArrowUpRight className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="p-2 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: `${statusConfig.color}15` }}
                        >
                          <StatusIcon
                            className="h-4 w-4"
                            style={{ color: statusConfig.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{order.order_number}</p>
                            <Badge variant={statusConfig.badgeVariant} className="text-xs">
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{order.customer_name || 'Guest'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-lg">
                          {formatCurrency(Number(order.total_amount))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No orders yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate('/vendor/dashboard/storefront')}
                >
                  View Storefront
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts > 0 && (
        <Card className="border-2 border-destructive/20 bg-gradient-to-br from-[hsl(48,96%,53%)]/10 via-destructive/5 to-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Products that need immediate restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {products
                  ?.filter((p: any) => p.stock_quantity <= p.low_stock_threshold)
                  .slice(0, 5)
                  .map((product: any) => {
                    const stockPercentage =
                      (product.stock_quantity / product.low_stock_threshold) * 100;
                    const isCritical = product.stock_quantity < product.low_stock_threshold * 0.5;
                    const borderColor = isCritical
                      ? 'border-destructive/30'
                      : 'border-[hsl(48,96%,53%)]/30';
                    const bgColor = isCritical ? 'bg-destructive/5' : 'bg-[hsl(48,96%,53%)]/5';

                    return (
                      <div
                        key={product.id}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-lg border-2 bg-card hover:bg-muted/50 transition-all',
                          borderColor,
                          bgColor,
                        )}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">{product.name}</p>
                            <Badge
                              variant={isCritical ? 'destructive' : 'secondary'}
                              className={cn(
                                'text-xs',
                                !isCritical &&
                                  'bg-[hsl(48,96%,53%)] text-white border-[hsl(48,96%,53%)]',
                              )}
                            >
                              {product.stock_quantity} left
                            </Badge>
                          </div>
                          <Progress value={Math.min(stockPercentage, 100)} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Threshold: {product.low_stock_threshold} units
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-4"
                          onClick={() => navigate(`/vendor/dashboard/inventory/edit/${product.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Edit Stock
                        </Button>
                      </div>
                    );
                  })}
                {lowStockProducts > 5 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/vendor/dashboard/inventory')}
                  >
                    View All {lowStockProducts} Low Stock Products
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

