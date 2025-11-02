/**
 * Orders Page Component
 * 
 * Displays all orders with filtering and sorting capabilities.
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download,
  MoreVertical,
  Eye,
  Package,
  Truck,
  CheckCircle
} from 'lucide-react';

const Orders: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const orders = [
    {
      id: '#ORD-001',
      customer: 'John Doe',
      email: 'john@example.com',
      items: 3,
      amount: '$45.99',
      status: 'completed',
      date: '2025-01-10',
      time: '10:30 AM',
    },
    {
      id: '#ORD-002',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      items: 2,
      amount: '$89.50',
      status: 'pending',
      date: '2025-01-10',
      time: '08:15 AM',
    },
    {
      id: '#ORD-003',
      customer: 'Mike Johnson',
      email: 'mike@example.com',
      items: 1,
      amount: '$34.00',
      status: 'processing',
      date: '2025-01-10',
      time: '06:45 AM',
    },
    {
      id: '#ORD-004',
      customer: 'Sarah Williams',
      email: 'sarah@example.com',
      items: 5,
      amount: '$123.75',
      status: 'completed',
      date: '2025-01-09',
      time: '03:20 PM',
    },
    {
      id: '#ORD-005',
      customer: 'David Brown',
      email: 'david@example.com',
      items: 2,
      amount: '$67.25',
      status: 'shipped',
      date: '2025-01-09',
      time: '11:10 AM',
    },
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', class: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'pending':
        return { label: 'Pending', class: 'bg-yellow-100 text-yellow-800', icon: Package };
      case 'processing':
        return { label: 'Processing', class: 'bg-blue-100 text-blue-800', icon: Package };
      case 'shipped':
        return { label: 'Shipped', class: 'bg-purple-100 text-purple-800', icon: Truck };
      default:
        return { label: status, class: 'bg-gray-100 text-gray-800', icon: Package };
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const stats = [
    { label: 'Total Orders', value: '1,234', color: 'blue' },
    { label: 'Pending', value: '45', color: 'yellow' },
    { label: 'Processing', value: '78', color: 'blue' },
    { label: 'Completed', value: '1,111', color: 'green' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">
          Manage and track all your customer orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by ID, customer, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mt-4">
          {['all', 'pending', 'processing', 'shipped', 'completed'].map((status) => {
            const info = getStatusInfo(status);
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? info.class
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Order ID</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Items</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Date & Time</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-blue-600">{order.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                        <p className="text-xs text-gray-500">{order.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-700">{order.items} items</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-gray-900">{order.amount}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm text-gray-900">{order.date}</p>
                        <p className="text-xs text-gray-500">{order.time}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
            <span className="font-medium">{filteredOrders.length}</span> orders
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
    </div>
  );
};

export default Orders;

