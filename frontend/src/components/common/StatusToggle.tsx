/**
 * Status Toggle Component
 * 
 * Single, clickable status toggle for vendor online/offline status.
 * Replaces duplicate status indicators with one unified component.
 */

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
        flex items-center justify-center gap-2 h-9 text-sm px-3 rounded-md font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-ring
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${
          online
            ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/30 hover:bg-green-500/20'
            : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
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

