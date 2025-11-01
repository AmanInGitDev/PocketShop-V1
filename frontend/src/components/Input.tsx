/**
 * Input Component
 * 
 * A reusable form input component with label, error handling, and icon support.
 * Follows accessibility best practices.
 */

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseStyles = 'w-full px-4 py-3 text-base border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const errorStyles = error
    ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
    : 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500';
  const iconStyles = icon && iconPosition === 'left' ? 'pl-10' : icon && iconPosition === 'right' ? 'pr-10' : '';
  
  const widthStyles = fullWidth ? 'w-full' : '';
  
  const inputClasses = `${baseStyles} ${errorStyles} ${iconStyles} ${widthStyles} ${className}`;
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-secondary-700 mb-2"
        >
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-secondary-400">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-error-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-secondary-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;

