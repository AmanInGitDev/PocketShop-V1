/**
 * Status Toggle Component
 * 
 * Single, clickable status toggle for vendor online/offline status.
 * Replaces duplicate status indicators with one unified component.
 */

import React from 'react';

interface StatusToggleProps {
  online: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function StatusToggle({ online, onToggle, disabled = false }: StatusToggleProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={online}
      className={`
        flex items-center gap-2 text-sm px-3 py-1.5 rounded-md font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${
          online
            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
            : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
        }
      `}
      title={online ? 'Click to go offline' : 'Click to go online'}
    >
      <span 
        className={`w-2 h-2 rounded-full ${
          online ? 'bg-green-500' : 'bg-gray-400'
        }`} 
      />
      <span className="hidden sm:inline">{online ? 'Online' : 'Offline'}</span>
    </button>
  );
}

