import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface CartSummaryProps {
  onCheckout: () => void;
}

export function CartSummary({ onCheckout }: CartSummaryProps) {
  const { getTotalItems, getTotalAmount } = useCart();
  const totalItems = getTotalItems();

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
              <p className="text-2xl font-bold">₹{getTotalAmount().toFixed(2)}</p>
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
