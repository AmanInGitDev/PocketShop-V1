import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { format } from "date-fns";
import { ChevronRight, Package, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

interface OrderCardProps {
  order: any;
}

export function OrderCard({ order }: OrderCardProps) {
  const navigate = useNavigate();

  const itemCount = order.order_items?.length || 0;

  // Fetch payment status for this order
  const { data: payment } = useQuery({
    queryKey: ['payment', order.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('payments')
        .select('payment_status')
        .eq('order_id', order.id)
        .maybeSingle();
      return data;
    },
  });

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/orders/${order.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">#{order.order_number}</span>
            </div>
            
            <div className="space-y-1">
              {order.customer_name && (
                <p className="text-sm font-medium">{order.customer_name}</p>
              )}
              {order.customer_phone && (
                <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
              <span className="font-medium">₹{order.total_amount}</span>
              {payment && (
                <Badge 
                  variant={payment.payment_status === 'completed' ? 'default' : 'secondary'}
                  className="gap-1"
                >
                  <DollarSign className="h-3 w-3" />
                  {payment.payment_status === 'completed' ? 'Paid' : 'Pending'}
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {format(new Date(order.created_at), 'PPp')}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <OrderStatusBadge status={order.status} />
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
