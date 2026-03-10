/**
 * AcceptanceCountdown – 5-minute acceptance timer for new/pending orders
 * Shown to vendor in Kanban and OrderDetailPanel, and to customer in OrderTracking.
 */
import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const ACCEPTANCE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

interface AcceptanceCountdownProps {
  createdAt: string; // ISO date string
  status: string; // 'NEW' | 'pending' or other
  variant?: 'compact' | 'full';
  /** Customer-facing: "Accept by" vs vendor-facing: "Accept within" */
  customerView?: boolean;
}

export function AcceptanceCountdown({
  createdAt,
  status,
  variant = 'full',
  customerView = false,
}: AcceptanceCountdownProps) {
  const isPending = status === 'NEW' || status === 'pending';

  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!isPending) {
      setRemainingMs(null);
      return;
    }

    const update = () => {
      const created = new Date(createdAt).getTime();
      const elapsed = Date.now() - created;
      const remaining = Math.max(0, ACCEPTANCE_WINDOW_MS - elapsed);
      setRemainingMs(remaining);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [createdAt, isPending]);

  if (!isPending) return null;

  const expired = remainingMs !== null && remainingMs <= 0;

  if (expired) {
    return (
      <div
        className={`flex items-center gap-2 ${
          variant === 'compact'
            ? 'text-amber-600 dark:text-amber-400 text-xs font-medium'
            : 'text-amber-600 dark:text-amber-400 text-sm font-medium'
        }`}
      >
        <Timer className="w-4 h-4 flex-shrink-0" aria-hidden />
        <span>Time expired – order may be cancelled</span>
      </div>
    );
  }

  const minutes = remainingMs !== null ? Math.floor(remainingMs / 60000) : 0;
  const seconds = remainingMs !== null ? Math.floor((remainingMs % 60000) / 1000) : 0;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const label = customerView
    ? 'Accept by vendor'
    : 'Accept within';

  return (
    <div
      className={`flex items-center gap-2 ${
        remainingMs !== null && remainingMs < 60000
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-gray-700 dark:text-slate-300'
      } ${variant === 'compact' ? 'text-xs font-medium' : 'text-sm font-medium'}`}
    >
      <Timer className="w-4 h-4 flex-shrink-0" aria-hidden />
      <span>
        {label}: <strong className="tabular-nums">{timeStr}</strong>
      </span>
    </div>
  );
}
