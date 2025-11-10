import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { useAnalytics, useAIInsights } from "@/features/vendor/hooks/useAnalytics";
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Clock,
  Lightbulb,
  TrendingDown,
  Calendar,
  Target,
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))', 'hsl(var(--chart-1))'];

export default function Analytics() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(30);
  const { data: insights, isLoading: insightsLoading } = useAIInsights();

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${period}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            <p className="text-muted-foreground">
              AI-powered insights and business intelligence
            </p>
          </div>
          <Badge variant="secondary" className="gap-2">
            <Calendar className="h-3 w-3" />
            Last 30 Days
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(analytics?.totalRevenue || 0)}
            icon={<DollarSign className="h-4 w-4" />}
            trend={{
              value: analytics?.weeklyComparison.revenueGrowth || 0,
              isPositive: (analytics?.weeklyComparison.revenueGrowth || 0) >= 0,
            }}
            description="vs last week"
            isLoading={analyticsLoading}
          />
          <MetricCard
            title="Total Orders"
            value={analytics?.totalOrders || 0}
            icon={<ShoppingCart className="h-4 w-4" />}
            trend={{
              value: analytics?.weeklyComparison.orderGrowth || 0,
              isPositive: (analytics?.weeklyComparison.orderGrowth || 0) >= 0,
            }}
            description="vs last week"
            isLoading={analyticsLoading}
          />
          <MetricCard
            title="Avg Order Value"
            value={formatCurrency(analytics?.averageOrderValue || 0)}
            icon={<TrendingUp className="h-4 w-4" />}
            isLoading={analyticsLoading}
          />
          <MetricCard
            title="Peak Hour"
            value={analytics?.peakHours[0] ? formatHour(analytics.peakHours[0].hour) : '--'}
            icon={<Clock className="h-4 w-4" />}
            description={analytics?.peakHours[0] ? `${analytics.peakHours[0].orders} orders` : ''}
            isLoading={analyticsLoading}
          />
        </div>

        {/* AI Insights */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insightsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : insights ? (
              <Tabs defaultValue="highlights">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="highlights">Highlights</TabsTrigger>
                  <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                  <TabsTrigger value="forecast">Forecast</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                <TabsContent value="highlights" className="space-y-2 mt-4">
                  {insights.highlights?.length > 0 ? (
                    insights.highlights.map((highlight: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                        <p className="text-sm">{highlight}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{insights.summary}</p>
                  )}
                </TabsContent>
                <TabsContent value="opportunities" className="space-y-2 mt-4">
                  {insights.opportunities?.length > 0 ? (
                    insights.opportunities.map((opp: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm">{opp}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Analyzing growth opportunities...</p>
                  )}
                </TabsContent>
                <TabsContent value="forecast" className="mt-4">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                    <p className="text-sm">{insights.forecast || 'Generating forecast...'}</p>
                  </div>
                </TabsContent>
                <TabsContent value="actions" className="space-y-2 mt-4">
                  {insights.actionItems?.length > 0 ? (
                    insights.actionItems.map((action: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center mt-1 flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{idx + 1}</span>
                        </div>
                        <p className="text-sm">{action}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Generating action items...</p>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-sm text-muted-foreground">
                AI insights will appear here once you have enough data
              </p>
            )}
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-[300px]" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.salesByDay || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-[300px]" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.peakHours || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={formatHour}
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      labelFormatter={formatHour}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Bar dataKey="orders" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-[300px]" />
              ) : (
                <div className="space-y-3">
                  {analytics?.topProducts.slice(0, 5).map((product: any, idx: number) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{idx + 1}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.totalSold} units • {product.orders} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold">{formatCurrency(product.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-[300px]" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.categoryPerformance || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.category}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="revenue"
                    >
                      {analytics?.categoryPerformance.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
