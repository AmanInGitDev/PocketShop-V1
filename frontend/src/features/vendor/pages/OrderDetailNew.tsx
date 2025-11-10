/**
 * Order Detail Page (New - Adapted from reference repo)
 * 
 * Detailed view of a single order with status management.
 * Adapted to use frontend's structure.
 * 
 * Note: Database queries will be adapted in Phase 3/4.
 */

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, Receipt } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderStatusSelect } from "@/components/orders/OrderStatusSelect";
import { OrderMessaging } from "@/components/orders/OrderMessaging";
import { OrderReceipt } from "@/components/orders/OrderReceipt";
import { PaymentStatusButton } from "@/components/orders/PaymentStatusButton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useVendor } from "@/features/vendor/hooks/useVendor";
import { useOrder } from "@/features/vendor/hooks/useOrder";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/constants/routes";

export default function OrderDetailNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showReceipt, setShowReceipt] = useState(false);
  const { data: vendor } = useVendor();
  const { data: order, isLoading } = useOrder(id);

  // Get payment for this order
  const { data: payment } = useQuery({
    queryKey: ['payment', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', id)
        .single();

      if (error) {
        // If table doesn't exist or no payment found, return null
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      return data;
    },
    enabled: !!id,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.VENDOR_DASHBOARD_ORDERS)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Order Not Found</h2>
            <p className="text-muted-foreground">
              The order you're looking for doesn't exist
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Order not found</p>
              <Button onClick={() => navigate(ROUTES.VENDOR_DASHBOARD_ORDERS)}>
                Back to Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.VENDOR_DASHBOARD_ORDERS)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Order Details</h2>
          <p className="text-muted-foreground">
            Order #{order.order_number}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowReceipt(!showReceipt)}>
            <Receipt className="mr-2 h-4 w-4" />
            {showReceipt ? 'Hide' : 'Show'} Receipt
          </Button>
        </div>
      </div>

      {showReceipt && (
        <OrderReceipt order={order} payment={payment} />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">{format(new Date(order.created_at), 'PPpp')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">₹{Number(order.total_amount).toLocaleString()}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Update Status</p>
              <OrderStatusSelect 
                orderId={order.id} 
                currentStatus={order.status as any}
                vendorId={vendor?.id}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{order.customer_name || 'Guest'}</p>
            </div>
            {order.customer_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{order.customer_phone}</p>
              </div>
            )}
            {order.customer_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{order.customer_email}</p>
              </div>
            )}
            {order.delivery_address && (
              <div>
                <p className="text-sm text-muted-foreground">Delivery Address</p>
                <p className="font-medium">{order.delivery_address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  {item.products?.image_url && (
                    <img 
                      src={item.products.image_url} 
                      alt={item.products.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.products?.name || 'Product'}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × ₹{Number(item.unit_price).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="font-medium">₹{Number(item.subtotal).toLocaleString()}</p>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4">
              <p className="text-lg font-semibold">Total</p>
              <p className="text-2xl font-bold">₹{Number(order.total_amount).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {payment && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentStatusButton orderId={order.id} payment={payment} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderMessaging orderId={order.id} vendorId={vendor?.id} />
        </CardContent>
      </Card>
    </div>
  );
}

