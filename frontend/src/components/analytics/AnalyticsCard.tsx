/**
 * AnalyticsCard
 *
 * Ported from Migration_Data/src/components/analytics/AnalyticsCard.tsx.
 * Used by the vendor Analytics page to show animated metric tiles.
 */

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Dot } from "lucide-react";

type AnalyticsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: number | null;
  deltaLabel?: string;
  trend?: "up" | "down" | "neutral";
  icon: ReactNode;
  tone?: "primary" | "accent" | "warning" | "info" | "neutral";
  loading?: boolean;
  isLive?: boolean;
  sparkline?: ReactNode;
  onClick?: () => void;
  className?: string;
};

const toneStyles: Record<
  NonNullable<AnalyticsCardProps["tone"]>,
  { bg: string; ring: string; text: string }
> = {
  primary: {
    bg: "bg-primary/10",
    ring: "shadow-[0_10px_30px_-12px_rgba(37,99,235,0.55)]",
    text: "text-primary",
  },
  accent: {
    bg: "bg-[hsl(142,71%,45%)]/10",
    ring: "shadow-[0_10px_30px_-12px_rgba(34,197,94,0.55)]",
    text: "text-[hsl(142,71%,45%)]",
  },
  warning: {
    bg: "bg-[hsl(48,96%,53%)]/10",
    ring: "shadow-[0_10px_30px_-12px_rgba(250,204,21,0.55)]",
    text: "text-[hsl(48,96%,53%)]",
  },
  info: {
    bg: "bg-[hsl(199,89%,48%)]/10",
    ring: "shadow-[0_10px_30px_-12px_rgba(14,165,233,0.55)]",
    text: "text-[hsl(199,89%,48%)]",
  },
  neutral: {
    bg: "bg-muted/50",
    ring: "shadow-[0_10px_30px_-12px_rgba(107,114,128,0.55)]",
    text: "text-muted-foreground",
  },
};

export function AnalyticsCard({
  title,
  value,
  subtitle,
  delta,
  deltaLabel,
  trend = "neutral",
  icon,
  tone = "primary",
  loading,
  isLive,
  sparkline,
  onClick,
  className,
}: AnalyticsCardProps) {
  const toneMeta = toneStyles[tone];
  const ButtonWrapper = onClick ? motion.button : motion.div;

  return (
    <ButtonWrapper
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 p-5 text-left transition-all duration-300 hover:border-transparent hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        "backdrop-blur supports-[backdrop-filter]:bg-card/75",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <motion.div
        layout="position"
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          toneMeta.bg,
        )}
      />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className={cn("rounded-2xl p-3 transition-colors", toneMeta.bg)}>
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn("block text-lg", toneMeta.text)}
            >
              {icon}
            </motion.span>
          </div>
          {isLive && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 rounded-full border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary"
            >
              <motion.span
                className="relative flex h-2 w-2"
                animate={{
                  scale: [0.9, 1.2, 0.9],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              >
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </motion.span>
              Live
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="h-10 w-32 rounded-xl" />
          ) : (
            <motion.p
              key={String(value)}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-semibold tracking-tight"
            >
              {value}
            </motion.p>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground/80">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
            {loading ? (
              <Skeleton className="h-4 w-24 rounded-full" />
            ) : delta !== undefined && delta !== null ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition-colors",
                  trend === "up" && "bg-emerald-500/15 text-emerald-500",
                  trend === "down" && "bg-red-500/15 text-red-500",
                  trend === "neutral" && "bg-muted/60 text-muted-foreground",
                )}
              >
                {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
                {trend === "neutral" && <Dot className="h-3 w-3" />}
                {Math.abs(delta).toFixed(1)}%
              </span>
            ) : null}
            {deltaLabel && (
              <span className="text-muted-foreground">{deltaLabel}</span>
            )}
          </div>
          {sparkline}
        </div>
      </div>
      <motion.div
        className={cn(
          "absolute inset-x-4 bottom-4 h-px origin-left scale-x-0 rounded-full transition-transform duration-700 group-hover:scale-x-100",
          toneMeta.text,
          toneMeta.ring,
        )}
      />
    </ButtonWrapper>
  );
}

