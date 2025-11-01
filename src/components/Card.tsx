/**
 * Card Component
 * 
 * A reusable card component for displaying content sections.
 * Supports title, subtitle, header, footer, and hover effects.
 */

import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  header,
  footer,
  hover = false,
  padding = 'md',
  className = '',
  children,
  onClick,
}) => {
  const baseStyles = 'bg-white rounded-xl shadow-md border border-secondary-200';
  const hoverStyles = hover ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const classes = `${baseStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`;
  
  return (
    <div className={classes} onClick={onClick}>
      {(title || subtitle || header) && (
        <div className="mb-4">
          {header || (
            <>
              {title && (
                <h3 className="text-xl font-semibold text-secondary-900 mb-1">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-secondary-600">{subtitle}</p>
              )}
            </>
          )}
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="mt-4 pt-4 border-t border-secondary-200">{footer}</div>}
    </div>
  );
};

export default Card;

