/**
 * Compact timer shown in the header when vendor is in an extended session.
 * Clear wording + info icon explaining auto-offline.
 * Extend button opens confirmation before adding 30 mins.
 */

import { useState } from 'react';
import { Clock, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExtendedSessionTimerProps {
  minutesRemaining: number;
  onExtend?: () => void;
}

export function ExtendedSessionTimer({ minutesRemaining, onExtend }: ExtendedSessionTimerProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExtendClick = () => setShowConfirm(true);

  const handleConfirm = () => {
    onExtend?.();
    setShowConfirm(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 h-9 text-amber-700 dark:text-amber-400 text-sm font-medium px-3 rounded-md bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200/60 dark:border-amber-800/50">
        <Clock className="h-4 w-4 shrink-0" />
        <span>
          Auto-offline in {minutesRemaining} min{minutesRemaining !== 1 ? 's' : ''}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="p-0.5 rounded hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              aria-label="What does this mean?"
            >
              <Info className="h-3.5 w-3.5 opacity-80" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[220px]">
            You&apos;ll automatically go offline when this timer ends.
            {onExtend ? ' Click Extend to add 30 more minutes.' : ''}
          </TooltipContent>
        </Tooltip>
        {onExtend && (
          <button
            type="button"
            onClick={handleExtendClick}
            className="text-xs font-medium underline underline-offset-2 hover:no-underline ml-0.5"
          >
            Extend
          </button>
        )}
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Extend session</AlertDialogTitle>
            <AlertDialogDescription>
              Add 30 more minutes to stay online? Your session will auto-offline when the new timer ends.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Extend by 30 mins</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
