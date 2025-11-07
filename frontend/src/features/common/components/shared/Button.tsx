import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-[#EF4F5F] text-white hover:bg-[#E63946] focus:ring-[#EF4F5F]',
    secondary: 'bg-[#37B7C3] text-white hover:bg-[#2A8B96] focus:ring-[#37B7C3]',
    outline: 'border-2 border-[#EF4F5F] text-[#EF4F5F] hover:bg-[#EF4F5F] hover:text-white focus:ring-[#EF4F5F]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

