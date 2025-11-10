/**
 * PaymentStatusChart Component
 * 
 * Displays a donut chart showing the distribution of payment statuses.
 * Includes animated transitions and clear legends with percentages.
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { usePaymentStatus, type PaymentStatusData } from '@/features/vendor/hooks/usePayouts';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

const PaymentStatusChart: React.FC = () => {
  const { data, isLoading, error } = usePaymentStatus();

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="animate-pulse text-gray-400">Loading chart data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600">Error loading chart data</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-400">No payment data available</p>
      </div>
    );
  }

  const COLORS = {
    paid: '#10b981', // green
    unpaid: '#f59e0b', // yellow
    refunded: '#ef4444', // red
  };

  const chartData = data.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.amount,
    count: item.count,
    percentage: Math.round(item.percentage * 10) / 10,
    color: COLORS[item.status],
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-gray-500">{data.count} transactions</p>
          <p className="text-xs text-gray-500">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'unpaid':
        return <Clock className="w-4 h-4" />;
      case 'refunded':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom Legend */}
      <div className="mt-6 space-y-3">
        {chartData.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex items-center gap-2">
                {getStatusIcon(item.name)}
                <span className="text-sm font-medium text-gray-900">{item.name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.value)}</p>
              <p className="text-xs text-gray-500">{item.percentage}% • {item.count} orders</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PaymentStatusChart;


