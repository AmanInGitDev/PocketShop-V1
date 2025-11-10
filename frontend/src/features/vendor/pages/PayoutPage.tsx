/**
 * PayoutPage Component
 * 
 * Main payout and revenue analytics page for vendor dashboard.
 * Displays payout insights with data visualization, charts, and transaction management.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, Wallet } from 'lucide-react';
import { usePayoutStats } from '@/features/vendor/hooks/usePayouts';
import StatCard from '@/components/payout/StatCard';
import RevenueTrendChart from '@/components/payout/RevenueTrendChart';
import PaymentStatusChart from '@/components/payout/PaymentStatusChart';
import RecentTransactionsTable from '@/components/payout/RecentTransactionsTable';
import WithdrawModal from '@/components/payout/WithdrawModal';

const PayoutPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = usePayoutStats();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleWithdraw = async (amount: number) => {
    // TODO: Implement actual withdrawal API call
    console.log('Withdrawing:', amount);
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Withdrawal initiated for:', amount);
        resolve();
      }, 1000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payouts & Revenue</h1>
            <p className="text-gray-600 mt-1">
              Track your earnings, payouts, and revenue analytics
            </p>
          </div>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            disabled={!stats || stats.pendingPayout === 0}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Withdraw Now
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            gradient="blue"
            growthPercentage={stats.growthPercentage}
          />
          <StatCard
            label="Pending Payout"
            value={formatCurrency(stats.pendingPayout)}
            icon={Wallet}
            gradient="orange"
          />
          <StatCard
            label="This Month's Successful Payments"
            value={formatCurrency(stats.thisMonthSuccessful)}
            icon={TrendingUp}
            gradient="green"
            growthPercentage={stats.growthPercentage}
          />
        </div>
      ) : null}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Revenue Trends</h2>
              <p className="text-sm text-gray-500 mt-1">Last 6 months overview</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <RevenueTrendChart />
        </motion.div>

        {/* Payment Status Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Payment Status</h2>
              <p className="text-sm text-gray-500 mt-1">Distribution by status</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <PaymentStatusChart />
        </motion.div>
      </div>

      {/* Recent Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <RecentTransactionsTable limit={50} />
      </motion.div>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableAmount={stats?.pendingPayout || 0}
        onConfirm={handleWithdraw}
      />
    </div>
  );
};

export default PayoutPage;


