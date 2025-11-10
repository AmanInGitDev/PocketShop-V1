/**
 * Payout Hooks
 * 
 * Custom hooks for fetching payout data, statistics, and transactions
 * Using sample/mock data for development (no database queries)
 */

import { useQuery } from '@tanstack/react-query';

export interface PayoutStats {
  totalRevenue: number;
  pendingPayout: number;
  thisMonthSuccessful: number;
  growthPercentage?: number;
}

export interface Transaction {
  id: string;
  transactionId: string;
  date: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'refunded';
  paymentMethod: string | null;
  orderId: string;
  customerName: string | null;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
}

export interface PaymentStatusData {
  status: 'paid' | 'unpaid' | 'refunded';
  count: number;
  amount: number;
  percentage: number;
}

// Sample data generators
const generateSampleTransactions = (count: number): Transaction[] => {
  const statuses: ('paid' | 'unpaid' | 'refunded')[] = ['paid', 'paid', 'paid', 'unpaid', 'refunded'];
  const paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Google Pay', 'Apple Pay', 'Cash'];
  const customers = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'David Brown', 'Emily Davis', 'Chris Wilson', 'Lisa Anderson'];
  
  const transactions: Transaction[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    
    const amount = Math.random() * 500 + 10; // $10 to $510
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    
    transactions.push({
      id: `order-${i + 1}`,
      transactionId: `TXN-${String(i + 1).padStart(6, '0')}`,
      date: date.toISOString(),
      amount: Math.round(amount * 100) / 100,
      status,
      paymentMethod,
      orderId: `order-${i + 1}`,
      customerName: customer,
    });
  }
  
  // Sort by date (newest first)
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const generateSampleRevenueTrend = (): RevenueDataPoint[] => {
  const months: RevenueDataPoint[] = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    // Generate realistic revenue with some growth trend
    const baseRevenue = 5000 + (5 - i) * 1000; // Increasing trend
    const variance = Math.random() * 2000 - 1000; // ±$1000 variance
    const revenue = Math.max(0, Math.round(baseRevenue + variance));
    
    months.push({
      month: monthName,
      revenue,
    });
  }
  
  return months;
};

const generateSamplePaymentStatus = (transactions: Transaction[]): PaymentStatusData[] => {
  const statusMap: { [key: string]: { count: number; amount: number } } = {
    paid: { count: 0, amount: 0 },
    unpaid: { count: 0, amount: 0 },
    refunded: { count: 0, amount: 0 },
  };
  
  transactions.forEach((tx) => {
    statusMap[tx.status].count++;
    statusMap[tx.status].amount += tx.amount;
  });
  
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  return Object.entries(statusMap).map(([status, data]) => ({
    status: status as 'paid' | 'unpaid' | 'refunded',
    count: data.count,
    amount: data.amount,
    percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
  }));
};

// Sample data
const SAMPLE_TRANSACTIONS = generateSampleTransactions(50);
const SAMPLE_REVENUE_TREND = generateSampleRevenueTrend();

/**
 * Hook to fetch payout statistics
 */
export const usePayoutStats = () => {
  return useQuery({
    queryKey: ['payout-stats'],
    queryFn: async (): Promise<PayoutStats> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const paidTransactions = SAMPLE_TRANSACTIONS.filter((t) => t.status === 'paid');
      const totalRevenue = paidTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Pending payout: Recent paid orders (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const pendingPayout = paidTransactions
        .filter((t) => new Date(t.date) >= thirtyDaysAgo)
        .reduce((sum, t) => sum + t.amount, 0);
      
      // This month's successful payments
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const thisMonthSuccessful = paidTransactions
        .filter((t) => {
          const date = new Date(t.date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate last month's revenue for growth percentage
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const lastMonthRevenue = paidTransactions
        .filter((t) => {
          const date = new Date(t.date);
          return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const growthPercentage =
        lastMonthRevenue > 0
          ? ((thisMonthSuccessful - lastMonthRevenue) / lastMonthRevenue) * 100
          : thisMonthSuccessful > 0
            ? 100
            : 0;
      
      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingPayout: Math.round(pendingPayout * 100) / 100,
        thisMonthSuccessful: Math.round(thisMonthSuccessful * 100) / 100,
        growthPercentage: Math.round(growthPercentage * 10) / 10,
      };
    },
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch revenue trend data (last 6 months)
 */
export const useRevenueTrend = () => {
  return useQuery({
    queryKey: ['revenue-trend'],
    queryFn: async (): Promise<RevenueDataPoint[]> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return SAMPLE_REVENUE_TREND;
    },
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch payment status distribution
 */
export const usePaymentStatus = () => {
  return useQuery({
    queryKey: ['payment-status'],
    queryFn: async (): Promise<PaymentStatusData[]> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return generateSamplePaymentStatus(SAMPLE_TRANSACTIONS);
    },
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch recent transactions
 */
export const usePayoutTransactions = (limit: number = 50) => {
  return useQuery({
    queryKey: ['payout-transactions', limit],
    queryFn: async (): Promise<Transaction[]> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 400));
      return SAMPLE_TRANSACTIONS.slice(0, limit);
    },
    refetchOnWindowFocus: false,
  });
};
