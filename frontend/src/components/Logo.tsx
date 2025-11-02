/**
 * Logo Component
 * 
 * Sample logo component for PocketShop.
 * This will be replaced with the actual logo when available.
 */

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Sample Logo - Purple gradient circle with "P" */}
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg`}
      >
        <span className="text-white font-bold text-lg">P</span>
      </div>
      <span
        className={`text-white font-bold ${
          size === 'sm' ? 'text-xl' : size === 'md' ? 'text-2xl' : 'text-3xl'
        }`}
      >
        PocketShop
      </span>
    </div>
  );
};

export default Logo;

