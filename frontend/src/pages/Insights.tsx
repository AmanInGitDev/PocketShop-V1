/**
 * Insights Page Component
 * 
 * Displays analytics and business insights with charts.
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag,
  Users,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

const Insights: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$45,678',
      change: 12.5,
      trend: 'up' as const,
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: 'Orders',
      value: '1,234',
      change: 8.3,
      trend: 'up' as const,
      icon: <ShoppingBag className="w-6 h-6" />,
    },
    {
      title: 'Customers',
      value: '856',
      change: -2.1,
      trend: 'down' as const,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: 'Average Order',
      value: '$37.02',
      change: 4.6,
      trend: 'up' as const,
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ];

  const topProducts = [
    { name: 'Classic Burger', sales: 234, revenue: '$3,038', growth: 15 },
    { name: 'Margherita Pizza', sales: 189, revenue: '$3,497', growth: 22 },
    { name: 'Chocolate Cake', sales: 145, revenue: '$2,318', growth: -8 },
    { name: 'Iced Coffee', sales: 432, revenue: '$2,808', growth: 45 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
          <p className="text-gray-600 mt-1">
            Analyze your business performance with detailed analytics
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {['7d', '30d', '90d', '1y'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {range === '7d' ? 'Last 7 days' : 
             range === '30d' ? 'Last 30 days' :
             range === '90d' ? 'Last 90 days' : 'Last year'}
          </button>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <div className="text-blue-600">
                {metric.icon}
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
              <div className={`flex items-center text-sm font-semibold ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(metric.change)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Revenue Trend</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <p className="text-gray-400">Revenue chart visualization</p>
            </div>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Orders Trend</h2>
            <ShoppingBag className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ShoppingBag className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-gray-400">Orders chart visualization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sales</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl">
                        {product.name === 'Classic Burger' ? '🍔' :
                         product.name === 'Margherita Pizza' ? '🍕' :
                         product.name === 'Chocolate Cake' ? '🎂' : '☕'}
                      </div>
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">{product.sales}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-gray-900">{product.revenue}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center text-sm font-medium ${
                      product.growth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.growth > 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(product.growth)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Peak Hours</h3>
          <p className="text-2xl font-bold text-blue-600 mb-4">12:00 PM - 2:00 PM</p>
          <p className="text-sm text-gray-600">
            Your busiest time with most orders during lunch hours
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Day</h3>
          <p className="text-2xl font-bold text-green-600 mb-4">Friday</p>
          <p className="text-sm text-gray-600">
            Highest sales and customer engagement on Fridays
          </p>
        </div>
      </div>
    </div>
  );
};

export default Insights;

