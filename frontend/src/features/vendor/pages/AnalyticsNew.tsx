/**
 * Analytics Page (New - Adapted from reference repo)
 * 
 * Analytics and insights page with charts and metrics.
 * Adapted to use frontend's structure.
 * 
 * Note: Hooks will be adapted in Phase 3. For now, using placeholder imports.
 */

import React from 'react';
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

export default function AnalyticsNew() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: insights, isLoading: insightsLoading } = useAIInsights();

  const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${period}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Insights and performance metrics for your business
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={analyticsLoading ? "..." : formatCurrency(analytics?.totalRevenue || 0)}
          icon={<DollarSign className="h-4 w-4" />}
          isLoading={analyticsLoading}
        />
        <MetricCard
          title="Total Orders"
          value={analyticsLoading ? "..." : analytics?.totalOrders || 0}
          icon={<ShoppingCart className="h-4 w-4" />}
          isLoading={analyticsLoading}
        />
        <MetricCard
          title="Avg Order Value"
          value={analyticsLoading ? "..." : formatCurrency(analytics?.averageOrderValue || 0)}
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={analyticsLoading}
        />
        <MetricCard
          title="Peak Hour"
          value={analyticsLoading ? "..." : analytics?.peakHours?.[0] ? formatHour(analytics.peakHours[0].hour) : 'N/A'}
          icon={<Clock className="h-4 w-4" />}
          isLoading={analyticsLoading}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (!analytics?.salesByDay || analytics.salesByDay.length === 0) ? (
                <div className="h-64 flex items-center justify-center text-center">
                  <div>
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">No revenue data available</p>
                    <p className="text-sm text-muted-foreground mt-1">Start receiving orders to see analytics</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.salesByDay.map(item => ({ date: item.date, revenue: item.amount }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (!analytics?.salesByDay || analytics.salesByDay.length === 0) ? (
                <div className="h-64 flex items-center justify-center text-center">
                  <div>
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">No order data available</p>
                    <p className="text-sm text-muted-foreground mt-1">Start receiving orders to see analytics</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.salesByDay.map(item => ({ date: item.date, orders: 1 }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Insights */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insightsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-2">
                {insights?.recommendations?.map((insight: any, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <Badge variant="outline">{insight.type}</Badge>
                    <p className="text-sm">{insight.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

