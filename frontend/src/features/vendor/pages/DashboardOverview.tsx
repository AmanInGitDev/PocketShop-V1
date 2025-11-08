/**
 * Dashboard Overview Component
 * 
 * Main dashboard page showing key metrics and recent activity.
 */

import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown,
  Users,
  Activity,
  AlertCircle
} from 'lucide-react';

const DashboardOverview: React.FC = () => {
  // Mock data - replace with real data from API
  const stats = [
    {
      title: 'Total Revenue',
      value: '$12,458',
      change: { value: 12, type: 'increase' as const },
      icon: <DollarSign className="w-6 h-6" />,
      color: 'success' as const,
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: { value: 8, type: 'increase' as const },
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'primary' as const,
    },
    {
      title: 'Growth Rate',
      value: '24%',
      change: { value: 5, type: 'increase' as const },
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'warning' as const,
    },
    {
      title: 'Active Customers',
      value: '892',
      change: { value: 3, type: 'increase' as const },
      icon: <Users className="w-6 h-6" />,
      color: 'primary' as const,
    },
  ];

  const recentOrders = [
    {
      id: '#ORD-001',
      customer: 'John Doe',
      amount: '$45.99',
      status: 'completed',
      date: '2 hours ago',
    },
    {
      id: '#ORD-002',
      customer: 'Jane Smith',
      amount: '$89.50',
      status: 'pending',
      date: '4 hours ago',
    },
    {
      id: '#ORD-003',
      customer: 'Mike Johnson',
      amount: '$34.00',
      status: 'processing',
      date: '6 hours ago',
    },
    {
      id: '#ORD-004',
      customer: 'Sarah Williams',
      amount: '$123.75',
      status: 'completed',
      date: '8 hours ago',
    },
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
          <Activity className="w-4 h-4" />
          <span className="text-sm font-medium">All systems operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const iconColors = {
            success: 'bg-green-50 text-green-600',
            primary: 'bg-blue-50 text-blue-600',
            warning: 'bg-orange-50 text-orange-600',
            error: 'bg-red-50 text-red-600',
          };
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <div className={`p-2 rounded-lg ${iconColors[stat.color]}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.change && (
                  <div className={`flex items-center text-sm font-semibold ${
                    stat.change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change.type === 'increase' ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {stat.change.value}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Revenue Overview</h2>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">Chart visualization will be implemented here</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
              <ShoppingBag className="w-5 h-5" />
              <span>Add New Product</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
              <TrendingUp className="w-5 h-5" />
              <span>View Analytics</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
              <Users className="w-5 h-5" />
              <span>Manage Customers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Order ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{order.customer}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-gray-900">{order.amount}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-yellow-900">Low Stock Alert</h3>
          <p className="text-sm text-yellow-700 mt-1">
            5 products are running low on inventory. Consider restocking soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

