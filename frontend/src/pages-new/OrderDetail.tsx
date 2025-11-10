import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { AppLayout } from "@/components/layout/AppLayout";
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
import { useState } from "react";
import { useVendor } from "@/features/vendor/hooks/useVendor";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showReceipt, setShowReceipt] = useState(false);
  const { data: vendor } = useVendor();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            subtotal,
            product_id,
            products (
              id,
              name,
              image_url
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: payment } = useQuery({
    queryKey: ['payment', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Order not found</p>
          <Button onClick={() => navigate('/orders')} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in print:p-8">
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/orders')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Order #{order.order_number}
              </h2>
              <p className="text-muted-foreground">
                {format(new Date(order.created_at), 'PPpp')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowReceipt(!showReceipt)}
            >
              <Receipt className="h-4 w-4 mr-2" />
              {showReceipt ? 'Hide' : 'Show'} Receipt
            </Button>
          </div>
        </div>

        {showReceipt && vendor && (
          <OrderReceipt order={order} vendor={vendor} payment={payment} />
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Items</CardTitle>
                <OrderStatusBadge status={order.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    {item.products.image_url && (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.products.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × ₹{item.unit_price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.subtotal}</p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{order.total_amount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {payment ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">{payment.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <Badge variant={payment.payment_status === 'completed' ? 'default' : 'secondary'}>
                        {payment.payment_status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium text-lg">₹{Number(payment.amount).toLocaleString()}</p>
                    </div>
                    <PaymentStatusButton 
                      orderId={order.id}
                      paymentStatus={payment.payment_status}
                      amount={Number(payment.amount)}
                    />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No payment record found</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.customer_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                )}
                {order.customer_phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {order.customer_phone}
                    </a>
                  </div>
                )}
                {order.customer_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${order.customer_email}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {order.customer_email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.notes}</p>
                </CardContent>
              </Card>
            )}

            <OrderMessaging orderId={order.id} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
