/**
 * Logo Component
 * 
 * Logo component for PocketShop.
 */

import React from 'react';
import logoImage from '../logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoImage}
        alt="PocketShop Logo"
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      <span
        className={`text-white font-bold ${textSizeClasses[size]}`}
      >
        PocketShop
      </span>
    </div>
  );
};

export default Logo;

