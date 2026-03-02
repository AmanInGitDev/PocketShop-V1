import { Badge } from "@/components/ui/badge";

// Temporary type until Phase 4 (database types generated)
type OrderStatus = 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
}

// Red is reserved for "Cancelled". "Unable to deliver" (vendor reject) uses orange.
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  pending: { label: "Pending", variant: "secondary" },
  processing: { label: "Processing", variant: "default" },
  ready: { label: "Ready", variant: "outline" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: {
    label: "Unable to deliver",
    variant: "outline",
    className: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  // Support legacy status values
  confirmed: { label: "Confirmed", variant: "default" },
  preparing: { label: "Preparing", variant: "default" },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" as const };

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
