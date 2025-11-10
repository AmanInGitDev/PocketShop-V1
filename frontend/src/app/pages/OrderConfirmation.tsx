import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface OrderData {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  items: Array<{
    product_id: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  created_at: string;
}

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const vendorId = searchParams.get('vendorId');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order ID is missing');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (fetchError) {
          console.error('Error fetching order:', fetchError);
          setError('Order not found. Please check your order ID.');
          setLoading(false);
          return;
        }

        setOrder(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details.');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
            <Button onClick={() => navigate(vendorId ? `/storefront/${vendorId}` : '/')}>
              Back to Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const paymentMethodDisplay = order.payment_method === 'cash' 
    ? 'Cash on Delivery' 
    : order.payment_method === 'upi' 
    ? 'UPI' 
    : order.payment_method === 'wallet' 
    ? 'Wallet' 
    : 'Online Payment';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for your order. Your order has been received and is being processed.
            </p>
            <div className="text-sm text-gray-500">
              <strong>Order Number:</strong> {order.order_number || order.id}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {order.customer_name}
                  </p>
                  {order.customer_phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {order.customer_phone}
                    </p>
                  )}
                  {order.customer_email && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {order.customer_email}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Status */}
              <div>
                <h3 className="font-semibold mb-2">Order Status</h3>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Status: <span className="capitalize">{order.status}</span>
                  </p>
                  <p>
                    Payment: <span className="capitalize">{order.payment_status}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.name || 'Item'}</p>
                    <p className="text-sm text-gray-500">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">₹{item.subtotal || (item.price * item.quantity)}</p>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-xl font-bold">₹{order.total_amount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium">{paymentMethodDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-medium capitalize">{order.payment_status}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          {vendorId && (
            <Button
              onClick={() => navigate(`/storefront/${vendorId}`)}
              variant="outline"
              className="flex-1"
            >
              Back to Store
            </Button>
          )}
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex-1"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

