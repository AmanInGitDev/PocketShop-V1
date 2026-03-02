/**
 * Modal shown when vendor tries to go online outside operational hours.
 * Offers adjustable duration in 5‑minute steps (default 30 mins).
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const MIN_MINS = 5;
const MAX_MINS = 120;
const STEP = 5;

interface GoOnlineOutsideHoursModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (minutes: number) => void | Promise<void>;
  /** When before opening: "opens at X". When after closing: "closed at X" */
  isBeforeOpening?: boolean;
  openingTimeFormatted: string | null;
  closingTimeFormatted: string | null;
  isConfirming?: boolean;
}

export function GoOnlineOutsideHoursModal({
  open,
  onClose,
  onConfirm,
  isBeforeOpening = false,
  openingTimeFormatted,
  closingTimeFormatted,
  isConfirming = false,
}: GoOnlineOutsideHoursModalProps) {
  const [minutes, setMinutes] = useState(30);

  useEffect(() => {
    if (open) setMinutes(30);
  }, [open]);

  const handleConfirm = async () => {
    await onConfirm(minutes);
    onClose();
  };

  const decrement = () => setMinutes((m) => Math.max(MIN_MINS, m - STEP));
  const increment = () => setMinutes((m) => Math.min(MAX_MINS, m + STEP));

  const stepperBtnClass =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-input bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:pointer-events-none';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-3">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <DialogTitle>Outside operational hours</DialogTitle>
              <DialogDescription>
                {isBeforeOpening && openingTimeFormatted
                  ? `You're outside your operating hours (opens at ${openingTimeFormatted}). Choose how long to stay online early:`
                  : closingTimeFormatted
                    ? `You're outside your operating hours (closed at ${closingTimeFormatted}). Choose how long to stay online:`
                    : "You're outside your operating hours. Choose how long to stay online:"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Duration stepper */}
        <div className="flex items-center justify-center gap-4 py-2">
          <button
            type="button"
            onClick={decrement}
            disabled={minutes <= MIN_MINS || isConfirming}
            className={cn(stepperBtnClass)}
            aria-label="Decrease duration"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[5rem] text-center text-lg font-semibold tabular-nums">
            {minutes} mins
          </span>
          <button
            type="button"
            onClick={increment}
            disabled={minutes >= MAX_MINS || isConfirming}
            className={cn(stepperBtnClass)}
            aria-label="Increase duration"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming
              ? 'Going online…'
              : isBeforeOpening
                ? `Go online early for ${minutes} mins`
                : `Go online for ${minutes} mins`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
