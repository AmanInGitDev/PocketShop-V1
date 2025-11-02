/**
 * Inventory Page Component
 * 
 * Manages product inventory with add/edit/delete capabilities.
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  CheckCircle,
  MoreVertical
} from 'lucide-react';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    {
      id: 1,
      name: 'Classic Burger',
      sku: 'FB-001',
      category: 'Food & Beverage',
      price: '$12.99',
      stock: 45,
      status: 'in_stock',
      image: '🍔',
    },
    {
      id: 2,
      name: 'Margherita Pizza',
      sku: 'FB-002',
      category: 'Food & Beverage',
      price: '$18.50',
      stock: 8,
      status: 'low_stock',
      image: '🍕',
    },
    {
      id: 3,
      name: 'Caesar Salad',
      sku: 'FB-003',
      category: 'Food & Beverage',
      price: '$9.99',
      stock: 0,
      status: 'out_of_stock',
      image: '🥗',
    },
    {
      id: 4,
      name: 'Chocolate Cake',
      sku: 'FB-004',
      category: 'Dessert',
      price: '$15.99',
      stock: 120,
      status: 'in_stock',
      image: '🎂',
    },
    {
      id: 5,
      name: 'Iced Coffee',
      sku: 'FB-005',
      category: 'Beverages',
      price: '$6.50',
      stock: 200,
      status: 'in_stock',
      image: '☕',
    },
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'in_stock':
        return { label: 'In Stock', class: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'low_stock':
        return { label: 'Low Stock', class: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
      case 'out_of_stock':
        return { label: 'Out of Stock', class: 'bg-red-100 text-red-800', icon: AlertTriangle };
      default:
        return { label: status, class: 'bg-gray-100 text-gray-800', icon: Package };
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Products', value: '125', icon: Package, color: 'blue' },
    { label: 'Low Stock', value: '12', icon: AlertTriangle, color: 'yellow' },
    { label: 'Out of Stock', value: '5', icon: AlertTriangle, color: 'red' },
    { label: 'Categories', value: '8', icon: Package, color: 'green' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">
            Manage your product inventory and stock levels
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const StatIcon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                  <StatIcon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 ml-12">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const statusInfo = getStatusInfo(product.status);
          const StatusIcon = statusInfo.icon;
          return (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 p-6">
                <div className="text-6xl">{product.image}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{product.sku}</p>
                  <p className="text-lg font-bold text-gray-900 mb-2">{product.price}</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                  </span>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Stock Level</p>
                    <p className="text-2xl font-bold text-gray-900">{product.stock}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Alert */}
      {products.some(p => p.status === 'low_stock' || p.status === 'out_of_stock') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Stock Alert</h3>
            <p className="text-sm text-yellow-700 mt-1">
              You have {products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length} products that need attention. Consider restocking soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

