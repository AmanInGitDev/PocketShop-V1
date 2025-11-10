import { Badge } from "@/components/ui/badge";

// Temporary type until Phase 4 (database types generated)
type OrderStatus = 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  processing: { label: "Processing", variant: "default" },
  ready: { label: "Ready", variant: "outline" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  // Support legacy status values
  confirmed: { label: "Confirmed", variant: "default" },
  preparing: { label: "Preparing", variant: "default" },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" as const };
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
