/**
 * RecentTransactionsTable Component
 * 
 * Displays a table of recent transactions with search and filter functionality.
 * Includes skeleton loader and status badges.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, CheckCircle, Clock, XCircle, Filter } from 'lucide-react';
import { usePayoutTransactions, type Transaction } from '@/features/vendor/hooks/usePayouts';

interface RecentTransactionsTableProps {
  limit?: number;
}

const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ limit = 50 }) => {
  const { data: transactions, isLoading, error } = usePayoutTransactions(limit);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'refunded'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter((transaction) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.orderId.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const transactionDate = new Date(transaction.date);
        const now = new Date();
        const diffTime = now.getTime() - transactionDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        switch (dateFilter) {
          case 'today':
            matchesDate = diffDays < 1;
            break;
          case 'week':
            matchesDate = diffDays < 7;
            break;
          case 'month':
            matchesDate = diffDays < 30;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [transactions, searchQuery, statusFilter, dateFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const statusConfig = {
      paid: {
        label: 'Paid',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200',
      },
      unpaid: {
        label: 'Pending',
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
      refunded: {
        label: 'Refunded',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200',
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600">Error loading transactions</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by transaction ID, customer, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Transaction ID
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Payment Method
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-gray-700">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-blue-600">
                        {transaction.transactionId}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(transaction.status)}</td>
                    <td className="py-4 px-4 text-sm text-gray-700">
                      {transaction.paymentMethod}
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Results Count */}
      {filteredTransactions.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredTransactions.length} of {transactions?.length || 0} transactions
        </div>
      )}
    </motion.div>
  );
};

export default RecentTransactionsTable;


