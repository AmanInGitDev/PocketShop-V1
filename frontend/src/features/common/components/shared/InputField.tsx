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
        <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-5 py-3.5 text-[#111827] rounded-lg
          border placeholder:text-[#9CA3AF]
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5522E2]/25 focus:border-[#5522E2]
          ${error
            ? 'border-[#E83935] focus:ring-[#E83935]/25 focus:border-[#E83935]'
            : 'border-[#E5E7EB]'
          }
        `}
        {...props}
      />
      {error && <p className="text-sm text-[#E83935] mt-1">{error}</p>}
      {helperText && !error && <p className="text-sm text-[#7E8C97] mt-1">{helperText}</p>}
    </div>
  );
};

