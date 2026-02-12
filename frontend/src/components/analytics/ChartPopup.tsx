/**
 * ChartPopup
 *
 * Ported from Migration_Data/src/components/analytics/ChartPopup.tsx.
 * Provides a dialog to show an expanded version of a selected chart.
 */

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ChartPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function ChartPopup({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ChartPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogContent
            asChild
            forceMount
            className={cn(
              "relative mx-auto max-w-5xl border border-white/10 bg-white/60 p-0 backdrop-blur-xl transition-none dark:bg-slate-900/80",
              "shadow-[0_50px_120px_-50px_rgba(15,23,42,0.65)]",
              className,
            )}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 18, stiffness: 220 }}
              className="flex h-[80vh] flex-col overflow-hidden rounded-3xl"
            >
              <DialogHeader className="flex flex-row items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-br from-white/70 via-white/40 to-transparent px-6 py-4 dark:from-slate-900/80 dark:via-slate-900/40">
                <div className="space-y-1.5">
                  <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    {title}
                  </DialogTitle>
                  {description && (
                    <DialogDescription className="text-sm text-muted-foreground">
                      {description}
                    </DialogDescription>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/70 text-slate-600 transition hover:scale-105 hover:bg-white dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </DialogHeader>
              <div className="relative flex flex-1 flex-col gap-4 overflow-hidden px-6 py-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_65%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(15,23,42,0.45),transparent_65%)]" />
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative h-full w-full rounded-3xl border border-white/10 bg-white/70 p-4 shadow-inner backdrop-blur dark:border-white/5 dark:bg-slate-900/80"
                >
                  {children}
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        ) : null}
      </AnimatePresence>
    </Dialog>
  );
}

