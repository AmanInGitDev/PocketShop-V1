/**
 * Stats Card Component
 * 
 * Displays key metrics with trend indicators.
 * Used in dashboard for showing sales, orders, revenue, etc.
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  trend,
  color = 'primary',
  className = '',
}) => {
  const colorStyles = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
  };
  
  const trendColors = {
    up: 'text-success-600',
    down: 'text-error-600',
    neutral: 'text-secondary-600',
  };
  
  const displayTrend = trend || (change?.type === 'increase' ? 'up' : change?.type === 'decrease' ? 'down' : 'neutral');
  
  return (
    <div className={`bg-white rounded-xl shadow-md border border-secondary-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-secondary-600">{title}</p>
        {icon && (
          <div className={`p-2 rounded-lg ${colorStyles[color]}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-bold text-secondary-900">{value}</p>
        {change && (
          <div className={`flex items-center text-sm font-semibold ${trendColors[displayTrend]}`}>
            {displayTrend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
            {displayTrend === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
            {displayTrend === 'neutral' && <Minus className="w-4 h-4 mr-1" />}
            {Math.abs(change.value)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;

