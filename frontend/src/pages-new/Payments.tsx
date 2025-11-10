import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { DollarSign, CreditCard, TrendingUp, Download, CheckCircle, Clock } from "lucide-react";
import { usePayments, usePaymentStats } from "@/features/vendor/hooks/usePayments";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useVendor } from "@/features/vendor/hooks/useVendor";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Payments() {
  const { data: payments, isLoading } = usePayments();
  const { data: stats, isLoading: statsLoading } = usePaymentStats();
  const { data: vendor } = useVendor();
  const queryClient = useQueryClient();

  // Real-time payment updates
  useEffect(() => {
    if (!vendor?.id) return;

    const channel = supabase
      .channel('payment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        (payload) => {
          console.log('Payment change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['payments'] });
          queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
          
          if (payload.eventType === 'UPDATE' && payload.new.payment_status === 'completed') {
            toast.success('💰 Payment received!', {
              description: `₹${payload.new.amount} has been credited.`
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendor?.id, queryClient]);

  // Calculate weekly revenue data
  const weeklyRevenueData = useMemo(() => {
    if (!payments) return [];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayPayments = payments.filter(p => 
        p.created_at.startsWith(date) && p.payment_status === 'completed'
      );
      const revenue = dayPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      
      return {
        date: format(new Date(date), 'MMM dd'),
        revenue: revenue,
      };
    });
  }, [payments]);

  // Calculate payment count by status
  const paymentStatusData = useMemo(() => {
    if (!payments) return [];

    const statusCounts = payments.reduce((acc, payment) => {
      const status = payment.payment_status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  }, [payments]);

  // Count successful payments
  const successfulPaymentsCount = useMemo(() => {
    if (!payments) return 0;
    return payments.filter(p => p.payment_status === 'completed').length;
  }, [payments]);

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--accent))',
    'hsl(142, 71%, 45%)', // success green
    'hsl(var(--destructive))',
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      card: "Card",
      upi: "UPI",
      wallet: "Wallet",
      cash: "Cash",
    };
    return labels[method] || method;
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
            <p className="text-muted-foreground">
              Track revenue and manage transactions in real-time
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value={`₹${stats?.totalRevenue.toFixed(2) || "0.00"}`}
            icon={<DollarSign className="h-4 w-4" />}
            description="All-time earnings"
            isLoading={statsLoading}
          />
          <MetricCard
            title="Pending Payouts"
            value={`₹${stats?.pendingPayouts.toFixed(2) || "0.00"}`}
            icon={<Clock className="h-4 w-4" />}
            description="Awaiting settlement"
            isLoading={statsLoading}
          />
          <MetricCard
            title="This Month"
            value={`₹${stats?.thisMonth.toFixed(2) || "0.00"}`}
            icon={<TrendingUp className="h-4 w-4" />}
            description="Current month revenue"
            isLoading={statsLoading}
          />
          <MetricCard
            title="Successful Payments"
            value={successfulPaymentsCount}
            icon={<CheckCircle className="h-4 w-4" />}
            description="Completed transactions"
            isLoading={isLoading}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Revenue</CardTitle>
              <CardDescription>Revenue trends over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
              <CardDescription>Distribution by payment status</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest payment transactions with real-time updates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : payments && payments.length > 0 ? (
                  payments.map((payment: any) => (
                    <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-xs">
                        {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.orders?.order_number || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {payment.orders?.customer_name || 'Guest'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {getPaymentMethodLabel(payment.payment_method)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ₹{Number(payment.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.payment_status)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No transactions yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Payments will appear here once customers start ordering
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
