/**
 * Banner shown when within 30 minutes of closing or opening time.
 * - Closing: countdown + "Extend by 30 mins"
 * - Opening: countdown + "Go online early for 30 mins"
 */

import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface OperationalHoursBannerProps {
  variant: 'closing' | 'opening';
  minutesUntil: number;
  timeFormatted: string;
  onAction: () => void;
  isActioning?: boolean;
}

export function OperationalHoursBanner({
  variant,
  minutesUntil,
  timeFormatted,
  onAction,
  isActioning = false,
}: OperationalHoursBannerProps) {
  const isClosing = variant === 'closing';
  const label = isClosing
    ? `Closing in ${minutesUntil} min${minutesUntil !== 1 ? 's' : ''}`
    : `Opens in ${minutesUntil} min${minutesUntil !== 1 ? 's' : ''}`;
  const buttonText = isClosing ? 'Extend by 30 mins' : 'Go online early for 30 mins';
  const buttonLoadingText = isClosing ? 'Extending…' : 'Going online…';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/50 px-4 py-3">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
        <Clock className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium">
          {label} ({timeFormatted})
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
        onClick={onAction}
        disabled={isActioning}
      >
        {isActioning ? buttonLoadingText : buttonText}
      </Button>
    </div>
  );
}
