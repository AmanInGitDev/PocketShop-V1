/**
 * Logo Component
 * 
 * Logo component for PocketShop.
 */

import React from 'react';
import logoImage from '@/assets/images/logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** 'light' = dark text (for light backgrounds), 'dark' = white text (for dark backgrounds) */
  variant?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', variant = 'dark' }) => {
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

  const textColor = variant === 'light'
    ? 'text-gray-900 dark:text-slate-100'
    : 'text-white';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoImage}
        alt="PocketShop Logo"
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      <span
        className={`${textColor} font-bold ${textSizeClasses[size]}`}
      >
        PocketShop
      </span>
    </div>
  );
};

export default Logo;

