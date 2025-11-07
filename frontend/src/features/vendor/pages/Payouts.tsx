/**
 * Payouts Page Component
 * 
 * Displays payout history and pending transactions.
 */

import React from 'react';
import { 
  DollarSign, 
  Calendar, 
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const Payouts: React.FC = () => {
  const summary = {
    available: '$12,458.92',
    pending: '$2,340.50',
    total: '$45,678.12',
  };

  const payouts = [
    {
      id: '#PAY-001',
      amount: '$8,234.56',
      status: 'completed',
      date: '2025-01-10',
      method: 'Bank Transfer',
      description: 'Weekly payout',
    },
    {
      id: '#PAY-002',
      amount: '$6,892.34',
      status: 'completed',
      date: '2025-01-03',
      method: 'Bank Transfer',
      description: 'Weekly payout',
    },
    {
      id: '#PAY-003',
      amount: '$2,340.50',
      status: 'pending',
      date: '2025-01-11',
      method: 'Bank Transfer',
      description: 'In progress',
    },
    {
      id: '#PAY-004',
      amount: '$7,123.45',
      status: 'completed',
      date: '2024-12-27',
      method: 'Bank Transfer',
      description: 'Weekly payout',
    },
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', class: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'pending':
        return { label: 'Pending', class: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'failed':
        return { label: 'Failed', class: 'bg-red-100 text-red-800', icon: AlertCircle };
      default:
        return { label: status, class: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
        <p className="text-gray-600 mt-1">
          Track your earnings and payout history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">Available Now</p>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.available}</p>
          <button className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Request Payout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.pending}</p>
          <p className="mt-2 text-sm text-gray-600">Processing within 2-3 business days</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">Total Earnings</p>
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.total}</p>
          <p className="mt-2 text-sm text-gray-600">All time earnings</p>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Payout History</h2>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payout ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Method</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payouts.map((payout) => {
                const statusInfo = getStatusInfo(payout.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-blue-600">{payout.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-lg font-bold text-gray-900">{payout.amount}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{payout.method}</p>
                        <p className="text-xs text-gray-500">{payout.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700">{payout.date}</span>
                    </td>
                    <td className="py-4 px-4">
                      {payout.status === 'completed' && (
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
            <span className="font-medium">{payouts.length}</span> payouts
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Payment Settings</h3>
        <p className="text-sm text-blue-700 mb-4">
          Manage your payout preferences and payment methods in Settings.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Go to Settings
        </button>
      </div>
    </div>
  );
};

export default Payouts;

