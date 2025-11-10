import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useVendor } from './useVendor';
import { startOfDay, subDays, format, parseISO, startOfWeek, endOfWeek } from 'date-fns';

export const useAnalytics = (days: number = 30) => {
  const { data: vendor } = useVendor();

  return useQuery({
    queryKey: ['analytics', vendor?.id, days],
    queryFn: async () => {
      if (!vendor?.id) throw new Error('No vendor ID');

      const startDate = startOfDay(subDays(new Date(), days));

      // Fetch orders (items are stored as JSONB in orders table)
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendor.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (ordersError) {
        // If table doesn't exist, return empty analytics
        if (ordersError.code === '42P01' || ordersError.message?.includes('does not exist')) {
          console.error('orders table does not exist. Please run database setup SQL files.');
          return getEmptyAnalytics();
        }
        throw ordersError;
      }

      // Calculate daily sales
      const salesByDay = orders?.reduce((acc, order) => {
        const day = format(parseISO(order.created_at), 'MMM dd');
        acc[day] = (acc[day] || 0) + Number(order.total_amount);
        return acc;
      }, {} as Record<string, number>);

      // Calculate hourly distribution (peak hours)
      const ordersByHour = orders?.reduce((acc, order) => {
        const hour = new Date(order.created_at).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Calculate product performance
      // Items are stored as JSONB array in orders.items
      const productStats = orders?.reduce((acc, order) => {
        const items = order.items || [];
        if (Array.isArray(items)) {
          items.forEach((item: any) => {
          const productId = item.product_id;
            const productName = item.name || 'Unknown';
            const category = 'Uncategorized'; // Category not stored in items JSONB
          
          if (!acc[productId]) {
            acc[productId] = {
              id: productId,
              name: productName,
              category,
              totalSold: 0,
              revenue: 0,
              orders: 0,
            };
          }
          
            acc[productId].totalSold += item.quantity || 0;
            acc[productId].revenue += Number(item.subtotal || (item.price * item.quantity) || 0);
          acc[productId].orders += 1;
        });
        }
        return acc;
      }, {} as Record<string, any>);

      // Calculate category performance
      const categoryStats = Object.values(productStats || {}).reduce((acc, product: any) => {
        const category = product.category;
        if (!acc[category]) {
          acc[category] = { category, revenue: 0, count: 0 };
        }
        acc[category].revenue += product.revenue;
        acc[category].count += product.totalSold;
        return acc;
      }, {} as Record<string, any>);

      // Calculate status distribution
      const statusDistribution = orders?.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate weekly comparison
      const thisWeekStart = startOfWeek(new Date());
      const lastWeekStart = startOfWeek(subDays(new Date(), 7));
      const lastWeekEnd = endOfWeek(subDays(new Date(), 7));

      const thisWeekOrders = orders?.filter(o => 
        new Date(o.created_at) >= thisWeekStart
      ) || [];
      
      const lastWeekOrders = orders?.filter(o => {
        const date = new Date(o.created_at);
        return date >= lastWeekStart && date <= lastWeekEnd;
      }) || [];

      const thisWeekRevenue = thisWeekOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const lastWeekRevenue = lastWeekOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

      return {
        totalRevenue: orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0,
        totalOrders: orders?.length || 0,
        averageOrderValue: orders?.length 
          ? (orders.reduce((sum, o) => sum + Number(o.total_amount), 0) / orders.length)
          : 0,
        salesByDay: Object.entries(salesByDay || {}).map(([date, amount]) => ({
          date,
          amount,
        })),
        peakHours: Object.entries(ordersByHour || {})
          .map(([hour, count]) => ({
            hour: parseInt(hour),
            orders: count,
          }))
          .sort((a, b) => b.orders - a.orders)
          .slice(0, 5),
        topProducts: Object.values(productStats || {})
          .sort((a: any, b: any) => b.revenue - a.revenue)
          .slice(0, 10),
        categoryPerformance: Object.values(categoryStats || {}),
        statusDistribution: Object.entries(statusDistribution || {}).map(([status, count]) => ({
          status,
          count,
        })),
        weeklyComparison: {
          thisWeek: {
            revenue: thisWeekRevenue,
            orders: thisWeekOrders.length,
          },
          lastWeek: {
            revenue: lastWeekRevenue,
            orders: lastWeekOrders.length,
          },
          revenueGrowth: lastWeekRevenue > 0 
            ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 
            : 0,
          orderGrowth: lastWeekOrders.length > 0
            ? ((thisWeekOrders.length - lastWeekOrders.length) / lastWeekOrders.length) * 100
            : 0,
        },
      };
    },
    enabled: !!vendor?.id,
    retry: false, // Don't retry on error
  });
};

function getEmptyAnalytics() {
  return {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    salesByDay: [],
    peakHours: [],
    topProducts: [],
    categoryPerformance: [],
    statusDistribution: [],
    weeklyComparison: {
      thisWeek: { revenue: 0, orders: 0 },
      lastWeek: { revenue: 0, orders: 0 },
      revenueGrowth: 0,
      orderGrowth: 0,
    },
  };
}

export const useAIInsights = () => {
  const { data: vendor } = useVendor();
  const { data: analytics } = useAnalytics(30);

  return useQuery({
    queryKey: ['ai-insights', vendor?.id, analytics],
    queryFn: async () => {
      if (!vendor?.id || !analytics) throw new Error('Missing data');

      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { 
          vendorId: vendor.id,
          analytics 
        },
      });

      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.id && !!analytics,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: false, // Don't retry on error (edge function may not exist yet)
  });
};

