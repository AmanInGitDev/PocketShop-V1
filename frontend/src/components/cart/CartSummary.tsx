import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface CartSummaryProps {
  onCheckout: () => void;
  /** Optional: discount applied (e.g. from vendor offers) */
  discountAmount?: number;
  discountLabel?: string;
}

export function CartSummary({ onCheckout, discountAmount = 0, discountLabel }: CartSummaryProps) {
  const { getTotalItems, getTotalAmount } = useCart();
  const totalItems = getTotalItems();
  const subtotal = getTotalAmount();
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const hasDiscount = discountAmount > 0;

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50 animate-in slide-in-from-bottom">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
              {hasDiscount ? (
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground line-through">₹{subtotal.toFixed(2)}</span>
                  <span className="text-2xl font-bold text-green-600">₹{finalTotal.toFixed(2)}</span>
                  {discountLabel && (
                    <span className="text-xs text-green-600">{discountLabel}</span>
                  )}
                </div>
              ) : (
                <p className="text-2xl font-bold">₹{subtotal.toFixed(2)}</p>
              )}
            </div>
          </div>
          <Button size="lg" onClick={onCheckout}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
