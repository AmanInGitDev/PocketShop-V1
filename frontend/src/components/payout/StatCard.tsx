/**
 * StatCard Component
 * 
 * Displays a statistic card with icon, value, label, and optional growth badge.
 * Includes Framer Motion animations for hover and reveal effects.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  gradient?: 'blue' | 'purple' | 'green' | 'orange';
  growthPercentage?: number;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  gradient = 'blue',
  growthPercentage,
  className = '',
}) => {
  const gradientClasses = {
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-pink-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-amber-600',
  };

  const iconBgClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Gradient accent bar */}
      <div className={`h-1 bg-gradient-to-r ${gradientClasses[gradient]}`} />

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <div className={`p-2.5 rounded-lg ${iconBgClasses[gradient]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900"
          >
            {value}
          </motion.p>

          {growthPercentage !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                growthPercentage >= 0
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {growthPercentage >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(growthPercentage)}%</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;


