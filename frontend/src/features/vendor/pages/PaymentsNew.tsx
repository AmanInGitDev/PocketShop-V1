import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { DollarSign, CreditCard, Download, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { usePayments, usePaymentStats } from "@/features/vendor/hooks/usePayments";
import { useVendor } from "@/features/vendor/hooks/useVendor";
import { supabase } from "@/lib/supabaseClient";

const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  pending: "secondary",
  failed: "destructive",
  refunded: "outline",
};

const PAYMENT_STATUS_COLORS = [
  "hsl(var(--primary))",
  "hsl(142, 71%, 45%)",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Card",
  upi: "UPI",
  wallet: "Wallet",
  cash: "Cash",
};

const formatCurrency = (amount: number | null | undefined) =>
  `₹${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PaymentsNew() {
  const paymentsQuery = usePayments();
  const statsQuery = usePaymentStats();
  const { data: vendor } = useVendor();
  const queryClient = useQueryClient();

  const payments = paymentsQuery.data ?? [];
  const isLoadingPayments = paymentsQuery.isLoading || paymentsQuery.isFetching;
  const stats = statsQuery.data;
  const isLoadingStats = statsQuery.isLoading || statsQuery.isFetching;

  useEffect(() => {
    if (!vendor?.id) return;

    const channel = supabase
      .channel("payments-feed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["payments", vendor.id] });
          queryClient.invalidateQueries({ queryKey: ["payment-stats", vendor.id] });

          if (payload.eventType === "UPDATE" && (payload.new as any)?.payment_status === "completed") {
            toast.success("💰 Payment received!", {
              description: `₹${Number((payload.new as any)?.amount || 0).toLocaleString()} has been credited.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendor?.id, queryClient]);

  const weeklyRevenueData = useMemo(() => {
    if (payments.length === 0) return [];

    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date;
    });

    return last7Days.map((date) => {
      const formatted = date.toISOString().split("T")[0];
      const dayPayments = payments.filter(
        (payment: any) =>
          payment.payment_status === "completed" &&
          payment.created_at?.startsWith(formatted)
      );

      const revenue = dayPayments.reduce((total: number, current: any) => total + Number(current.amount || 0), 0);

      return {
        date: format(date, "MMM dd"),
        revenue,
      };
    });
  }, [payments]);

  const paymentStatusData = useMemo(() => {
    if (payments.length === 0) return [];

    const counts = payments.reduce<Record<string, number>>((accumulator, payment: any) => {
      const status = payment.payment_status || "unknown";
      accumulator[status] = (accumulator[status] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  }, [payments]);

  const successfulPaymentsCount = useMemo(
    () => payments.filter((payment: any) => payment.payment_status === "completed").length,
    [payments]
  );

  const renderStatusBadge = (status: string) => (
    <Badge variant={STATUS_BADGE_VARIANTS[status] ?? "outline"} className="capitalize">
      {status}
    </Badge>
  );

  const renderPaymentMethod = (method?: string | null) => (
    <Badge variant="secondary" className="capitalize">
      {PAYMENT_METHOD_LABELS[method ?? ""] ?? method ?? "N/A"}
    </Badge>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">Track revenue and manage transactions in real time</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={isLoadingStats ? "..." : formatCurrency(stats?.totalRevenue)}
          description="All-time earnings"
          icon={<DollarSign className="h-4 w-4" />}
          isLoading={isLoadingStats}
        />
        <MetricCard
          title="Pending Payouts"
          value={isLoadingStats ? "..." : formatCurrency(stats?.pendingPayouts)}
          description="Awaiting settlement"
          icon={<Clock className="h-4 w-4" />}
          isLoading={isLoadingStats}
        />
        <MetricCard
          title="This Month"
          value={isLoadingStats ? "..." : formatCurrency(stats?.thisMonth)}
          description="Current month revenue"
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoadingStats}
        />
        <MetricCard
          title="Successful Payments"
          value={isLoadingPayments ? "..." : successfulPaymentsCount}
          description="Completed transactions"
          icon={<CheckCircle className="h-4 w-4" />}
          isLoading={isLoadingPayments}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
            <CardDescription>Revenue trends over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingPayments ? (
              <Skeleton className="h-[300px] w-full" />
            ) : weeklyRevenueData.every((data) => data.revenue === 0) ? (
              <div className="flex h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
                <TrendingUp className="mb-2 h-12 w-12 opacity-50" />
                <p>No revenue data available</p>
                <p className="mt-1 text-sm">Start receiving payments to see trends</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, "Revenue"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
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
            {isLoadingPayments ? (
              <Skeleton className="h-[300px] w-full" />
            ) : paymentStatusData.length === 0 ? (
              <div className="flex h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
                <CreditCard className="mb-2 h-12 w-12 opacity-50" />
                <p>No payment data available</p>
                <p className="mt-1 text-sm">Start receiving payments to see distribution</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(payload: any) => `${payload.name}: ${(payload.percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {paymentStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PAYMENT_STATUS_COLORS[index % PAYMENT_STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest payment transactions with real-time updates</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead>Date &amp; Time</TableHead>
                  <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {isLoadingPayments ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <CreditCard className="mx-auto mb-2 h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No transactions yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Payments will appear here once customers start ordering
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment: any) => (
                  <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-mono text-xs">
                      {format(new Date(payment.created_at), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">{payment.orders?.order_number ?? "N/A"}</TableCell>
                    <TableCell>{payment.orders?.customer_name ?? "Guest"}</TableCell>
                    <TableCell>{renderPaymentMethod(payment.payment_method)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>{renderStatusBadge(payment.payment_status)}</TableCell>
                  </TableRow>
                ))
              )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

