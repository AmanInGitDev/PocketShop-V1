import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helperText,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 border-2 rounded-lg font-medium
          transition-all duration-200 focus:outline-none
          ${error
            ? 'border-[#E83935] focus:ring-2 focus:ring-[#E83935] focus:ring-offset-0'
            : 'border-[#E8E8E8] focus:border-[#EF4F5F] focus:ring-2 focus:ring-[#EF4F5F] focus:ring-offset-0'
          }
          placeholder:text-[#7E8C97]
        `}
        {...props}
      />
      {error && <p className="text-sm text-[#E83935] mt-1">{error}</p>}
      {helperText && !error && <p className="text-sm text-[#7E8C97] mt-1">{helperText}</p>}
    </div>
  );
};

