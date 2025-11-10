import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, CreditCard, Smartphone, Wallet, Banknote } from 'lucide-react';
import { checkoutFormSchema, type CheckoutFormData } from '@/schemas/checkoutSchema';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface CheckoutFormProps {
  onBack: () => void;
  onCheckout: (data: CheckoutFormData, paymentMethod: 'card' | 'upi' | 'wallet' | 'cash') => Promise<void>;
}

export function CheckoutForm({ onBack, onCheckout }: CheckoutFormProps) {
  const { cartItems, getTotalAmount, deleteFromCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'upi' | 'wallet' | 'cash' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    trigger,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    mode: 'onBlur',
  });

  // Log form errors for debugging
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.error('Form validation errors:', errors);
    }
  }, [errors]);

  // Load customer profile if authenticated
  useEffect(() => {
    const loadCustomerProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (profile) {
          reset({
            name: profile.name,
            phone: profile.mobile_number,
            email: profile.email || '',
            notes: '',
          });
        }
      }
    };
    loadCustomerProfile();
  }, [reset]);

  const handlePaymentMethodSelect = async (
    data: CheckoutFormData,
    method: 'card' | 'upi' | 'wallet' | 'cash'
  ) => {
    console.log('handlePaymentMethodSelect called with:', { method, data });
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate form before processing
    if (!data.name || !data.phone) {
      toast.error('Please fill in all required fields');
      console.error('Validation failed: missing name or phone', { name: data.name, phone: data.phone });
      return;
    }

    setIsProcessing(true);
    setSelectedPaymentMethod(method);

    try {
      console.log('Processing checkout with method:', method, 'Data:', data);
      await onCheckout(data, method);
      console.log('Checkout completed successfully');
      // If onCheckout succeeds, it should navigate away or clear the form
      // Don't reset processing state here if navigation is expected
    } catch (error: any) {
      console.error('Checkout error:', error);
      console.error('Error details:', {
        message: error?.message,
        error: error?.error,
        stack: error?.stack,
      });
      const errorMessage = error?.message || error?.error || 'Failed to process checkout. Please try again.';
      toast.error(errorMessage, {
        duration: 5000,
      });
      // Reset processing state on error so user can try again
      setIsProcessing(false);
      setSelectedPaymentMethod(null);
    }
    // Note: We don't reset processing state in finally block if navigation is expected
    // The component will unmount on successful navigation
  };

  const onSubmit = (_data: CheckoutFormData) => {
    // This will be triggered when any payment method is clicked
    // since the form wraps the payment buttons
  };

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Button onClick={onBack}>Back to Shop</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex justify-between items-center">
                <div className="flex items-center gap-3 flex-1">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>₹{item.price}</span>
                      <Badge variant="secondary" className="text-xs">
                        ×{item.quantity}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFromCart(item.productId)}
                    disabled={isProcessing}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold">
                ₹{getTotalAmount().toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Customer Information</h3>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">
              Full Name <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground block font-normal mt-1">
                Required for order processing
              </span>
            </Label>
            <Input
              id="name"
              {...register('name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
              })}
              placeholder="Enter your full name (e.g., John Doe)"
              disabled={isProcessing}
              className={errors.name ? 'border-destructive border-2' : ''}
              autoComplete="name"
              onBlur={() => trigger('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive font-medium">{errors.name.message}</p>
            )}
            {!errors.name && (
              <p className="text-xs text-muted-foreground">
                Enter your full name as it should appear on the order
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="9876543210 or +91 9876543210"
              disabled={isProcessing}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter your phone number (10-15 digits)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@example.com"
              disabled={isProcessing}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions (optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Any special requests or instructions..."
              rows={3}
              disabled={isProcessing}
              className={errors.notes ? 'border-destructive' : ''}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Select Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col gap-2"
              onClick={handleSubmit((data) => handlePaymentMethodSelect(data, 'card'))}
              disabled={isProcessing}
            >
              <CreditCard className="h-6 w-6" />
              <span>Card / Online</span>
            </Button>

            <Button
              type="button"
              variant={selectedPaymentMethod === 'upi' ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col gap-2"
              onClick={handleSubmit((data) => handlePaymentMethodSelect(data, 'upi'))}
              disabled={isProcessing}
            >
              <Smartphone className="h-6 w-6" />
              <span>UPI</span>
            </Button>

            <Button
              type="button"
              variant={selectedPaymentMethod === 'wallet' ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col gap-2"
              onClick={handleSubmit((data) => handlePaymentMethodSelect(data, 'wallet'))}
              disabled={isProcessing}
            >
              <Wallet className="h-6 w-6" />
              <span>Wallet</span>
            </Button>

            <Button
              type="button"
              variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col gap-2 relative"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('=== COD BUTTON CLICKED ===');
                
                // Get current form values
                const currentValues = getValues();
                console.log('Current form values:', currentValues);
                console.log('Form errors:', errors);
                
                // Check if name field is filled - show helpful error if not
                const nameValue = currentValues.name?.trim() || '';
                if (!nameValue || nameValue.length < 2) {
                  const errorMsg = !nameValue 
                    ? 'Please enter your full name in the "Full Name" field above'
                    : 'Name must be at least 2 characters';
                  toast.error(errorMsg, { duration: 6000 });
                  console.error('Name validation failed:', { 
                    nameValue, 
                    length: nameValue.length,
                    currentValues 
                  });
                  // Scroll to name field if it exists
                  const nameInput = document.getElementById('name');
                  if (nameInput) {
                    nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    nameInput.focus();
                  }
                  return;
                }
                
                // Check if phone field is filled
                const phoneValue = currentValues.phone?.trim() || '';
                const phoneDigits = phoneValue.replace(/\D/g, '');
                if (!phoneValue || phoneDigits.length < 10) {
                  const errorMsg = !phoneValue
                    ? 'Please enter your phone number'
                    : `Phone number must have at least 10 digits (you entered ${phoneDigits.length})`;
                  toast.error(errorMsg, { duration: 6000 });
                  console.error('Phone validation failed:', { 
                    phoneValue, 
                    digits: phoneDigits.length 
                  });
                  // Scroll to phone field if it exists
                  const phoneInput = document.getElementById('phone');
                  if (phoneInput) {
                    phoneInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    phoneInput.focus();
                  }
                  return;
                }
                
                // All required fields are filled, proceed with checkout
                console.log('All validations passed, proceeding with checkout...');
                console.log('Form data:', {
                  name: nameValue,
                  phone: phoneValue,
                  email: currentValues.email,
                  notes: currentValues.notes,
                });
                
                try {
                  await handlePaymentMethodSelect({
                    name: nameValue,
                    phone: phoneValue,
                    email: currentValues.email || '',
                    notes: currentValues.notes || '',
                  }, 'cash');
                } catch (err) {
                  console.error('Error in handlePaymentMethodSelect:', err);
                }
              }}
              disabled={isProcessing}
            >
              <Banknote className="h-6 w-6" />
              <span>Cash on Delivery</span>
              {isProcessing && selectedPaymentMethod === 'cash' && (
                <span className="text-xs animate-pulse">Processing...</span>
              )}
            </Button>
          </div>

          {isProcessing && (
            <div className="text-center text-sm text-muted-foreground">
              Processing your order...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onBack}
        disabled={isProcessing}
      >
        Back to Menu
      </Button>
    </form>
  );
}
