/**
 * POS Mode - Fast-tap interface for quick cash sales
 * Migrated from Migration_Data/backup-after-f94dab5
 */

import { useState, useCallback } from 'react';
import { useProducts } from '@/features/vendor/hooks/useProducts';
import { useVendor } from '@/features/vendor/hooks/useVendor';
import { supabase } from '@/lib/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Minus, Plus, Trash2, Banknote, Loader2, Printer, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { LazyImage } from '@/components/ui/lazy-image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OrderReceipt } from './OrderReceipt';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

export function POSMode() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: vendor } = useVendor();
  const queryClient = useQueryClient();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('0000000000');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [search, setSearch] = useState('');
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const availableProducts = (products || [])
    .filter((p: { is_available?: boolean; stock_quantity?: number | null }) => p.is_available && (p.stock_quantity === null || p.stock_quantity === undefined || p.stock_quantity > 0))
    .filter((p: { name?: string }) => !search || (p.name || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a: { name?: string }, b: { name?: string }) => (a.name || '').localeCompare(b.name || ''));

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = useCallback((product: { id: string; name: string; price: number; image_url?: string | null; stock_quantity?: number | null }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (product.stock_quantity != null && existing.quantity >= product.stock_quantity) {
          toast.error(`Only ${product.stock_quantity} in stock`);
          return prev;
        }
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.image_url || null,
      }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const handleQuickCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (!vendor?.id) {
      toast.error('Vendor not loaded');
      return;
    }

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          vendorId: vendor.id,
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          customerName,
          customerPhone,
          customerEmail: null,
          paymentMethod: 'cash',
          notes: 'POS Mode - Cash Sale',
          customerId: null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.order?.id) {
        await supabase
          .from('payments')
          .update({ payment_status: 'completed' })
          .eq('order_id', data.order.id);
      }

      toast.success(`Order ${data.order?.orderNumber || data.order?.id} created!`);

      const receiptData = {
        id: data.order.id,
        order_number: data.order?.orderNumber || data.order?.id,
        total_amount: data.order?.totalAmount || cartTotal,
        created_at: new Date().toISOString(),
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: null,
        order_items: cart.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
          products: { name: item.name },
        })),
      };

      setReceiptOrder(receiptData);
      setShowReceipt(true);
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err: unknown) {
      console.error('POS checkout error:', err);
      toast.error(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-280px)] min-h-[500px]">
      <div className="lg:col-span-2 flex flex-col gap-3 overflow-hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
            {availableProducts.map((product: { id: string; name: string; price: number; image_url?: string | null; stock_quantity?: number | null; low_stock_threshold?: number }) => {
              const inCart = cart.find((i) => i.productId === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`relative group rounded-xl border-2 p-3 text-left transition-all duration-150 active:scale-95
                    ${inCart ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50 hover:shadow-sm bg-card'}`}
                >
                  {product.image_url ? (
                    <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-muted">
                      <LazyImage src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg mb-2 bg-muted flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                  <p className="font-semibold text-sm truncate">{product.name}</p>
                  <p className="text-primary font-bold text-base">₹{product.price}</p>
                  {product.stock_quantity != null && product.stock_quantity <= (product.low_stock_threshold || 10) && (
                    <Badge variant="destructive" className="absolute top-2 right-2 text-[10px] px-1.5 py-0">
                      {product.stock_quantity} left
                    </Badge>
                  )}
                  {inCart && (
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow">
                      {inCart.quantity}
                    </div>
                  )}
                </button>
              );
            })}
            {availableProducts.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {search ? 'No products match your search' : 'No products available'}
              </div>
            )}
          </div>
        </div>
      </div>

      <Card className="flex flex-col overflow-hidden border-2">
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-lg">Quick Cart</h3>
              {cart.length > 0 && (
                <Badge variant="secondary">{cart.reduce((s, i) => s + i.quantity, 0)}</Badge>
              )}
            </div>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Input placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="text-xs h-8" />
            <Input placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="text-xs h-8" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <ShoppingCart className="h-10 w-10 opacity-30" />
              <p className="text-sm">Tap products to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="flex items-center gap-2 rounded-lg border p-2 bg-background">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t p-4 space-y-3 bg-muted/30">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Total</span>
            <span className="text-2xl font-bold text-primary">₹{cartTotal.toFixed(2)}</span>
          </div>
          <Button
            className="w-full h-14 text-lg font-bold gap-3"
            size="lg"
            disabled={cart.length === 0 || isCheckingOut}
            onClick={handleQuickCheckout}
          >
            {isCheckingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <Banknote className="h-5 w-5" />}
            {isCheckingOut ? 'Processing...' : 'Quick Checkout — Cash'}
          </Button>
        </div>
      </Card>

      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Order Complete
              <Button variant="ghost" size="icon" onClick={() => { setShowReceipt(false); setReceiptOrder(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {receiptOrder && vendor && (
            <div className="space-y-4">
              <OrderReceipt
                order={receiptOrder}
                vendor={vendor}
                payment={{ payment_method: 'cash', payment_status: 'completed' }}
              />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => { window.print(); setShowReceipt(false); setReceiptOrder(null); }}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print & Close
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => { setShowReceipt(false); setReceiptOrder(null); }}>
                  Skip
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
