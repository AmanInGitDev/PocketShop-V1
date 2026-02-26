import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { LazyImage } from "@/components/ui/lazy-image";
import { ShoppingCart, Store, MapPin, Search, X, Plus, Minus, User, LogOut, LogIn } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CartSummary } from "@/components/cart/CartSummary";
import { validateCartItems } from "@/schemas/checkoutSchema";
import type { CheckoutFormData } from "@/schemas/checkoutSchema";
import { ActiveOrdersWidget } from "@/components/storefront/ActiveOrdersWidget";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function PublicStorefront() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalItems,
    getItemQuantity,
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [onlyVeg, setOnlyVeg] = useState(false);

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email || "");
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email || "");
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      setIsAuthenticated(false);
      setUserEmail("");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  // Listen for showCart event from CustomerBottomNav (mobile)
  useEffect(() => {
    const handleShowCart = () => {
      const total = getTotalItems();
      if (total > 0) {
        setShowCheckout(true);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('showCart', handleShowCart);
    return () => window.removeEventListener('showCart', handleShowCart);
  }, []);

  // Fetch vendor data
  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['public-vendor', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('id', vendorId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['public-products', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
  });

  // Get unique categories
  const categories = useMemo(() => {
    if (!products) return [];
    const uniqueCategories = new Set(
      products
        .map((p) => p.category)
        .filter((cat): cat is string => !!cat)
    );
    return Array.from(uniqueCategories).sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter((product) => {
      if (onlyVeg && product.diet_type !== "veg") {
        return false;
      }
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [products, selectedCategory, searchQuery, onlyVeg]);

  const handleCheckout = async (
    customerData: CheckoutFormData,
    paymentMethod: 'card' | 'upi' | 'wallet' | 'cash'
  ) => {
    try {
      if (!vendorId) {
        throw new Error('Storefront not found. Please refresh and try again.');
      }

      // Get authenticated user if any, then resolve customer_profiles.id
      // orders.customer_id must reference customer_profiles(id), NOT auth.users(id)
      let customerProfileId: string | null = null;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('customer_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        customerProfileId = profile?.id ?? null;
      }

      // Validate cart items
      const items = Object.entries(cart).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      validateCartItems(items);

      // Create order (tries Edge Function first, falls back to direct DB insertion)
      const { createOrder } = await import('@/services/orderService');

      const orderData = await createOrder({
            vendorId,
            items,
            customerName: customerData.name,
            customerPhone: customerData.phone,
            customerEmail: customerData.email || null,
            paymentMethod: paymentMethod !== 'card' ? paymentMethod : null,
            notes: customerData.notes || null,
            customerId: customerProfileId,
      }, {
        useEdgeFunction: true, // Try Edge Function first, fallback to direct DB
      });

      if (!orderData.success) {
        console.error('Order creation failed:', orderData.error);
        throw new Error(orderData.error || 'Failed to create order');
      }

      const { order } = orderData;

      if (!order || !order.id) {
        console.error('Order creation returned invalid data:', orderData);
        throw new Error('Order creation failed. Please try again.');
      }

      console.log('Order created successfully, order ID:', order.id);

      // Handle card payment
      if (paymentMethod === 'card') {
        try {
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
          'create-checkout-session',
          {
            body: {
              orderId: order.id,
              orderAmount: order.totalAmount,
              customerEmail: customerData.email,
              customerName: customerData.name,
            },
          }
        );

        if (sessionError) {
            console.error('Payment session creation error:', sessionError);
            throw new Error('Failed to create payment session. Please try again.');
        }

        if (sessionData?.url) {
          window.open(sessionData.url, '_blank');
          toast.success("Redirecting to payment...");
            clearCart();
            setShowCheckout(false);
          } else {
            throw new Error('Payment session URL not received. Please try again.');
          }
        } catch (paymentError: any) {
          console.error('Payment processing error:', paymentError);
          // Order was created but payment failed - still show success but warn user
          toast.error(paymentError.message || 'Payment processing failed. Your order was created but payment is pending.');
          clearCart();
          setShowCheckout(false);
          navigate(`/order-confirmation?orderId=${order.id}&vendorId=${vendorId}`);
        }
      } else {
        // For non-card payments (UPI, wallet, cash), navigate to order confirmation
        console.log('Navigating to order confirmation for order:', order.id);
        clearCart();
        setShowCheckout(false);
        toast.success('Order placed successfully!');
        navigate(`/order-confirmation?orderId=${order.id}&vendorId=${vendorId}`);
      }
    } catch (error: any) {
      console.error('Checkout error in handleCheckout:', error);
      // Re-throw with more context
      throw new Error(error.message || error.error || 'Failed to process checkout. Please try again.');
    }
  };

  if (vendorLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Storefront not found</h2>
          <p className="text-muted-foreground">
            This storefront is not available or has been deactivated
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24">
      {/* Header / Hero */}
      <header className="bg-gradient-to-b from-orange-500 to-orange-400 text-white pb-6 shadow-md">
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {vendor.logo_url && (
                <img
                  src={vendor.logo_url}
                  alt={vendor.business_name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white/70"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold leading-tight">{vendor.business_name}</h1>
                {vendor.description && (
                  <p className="text-sm text-white/90">{vendor.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Account"
                      className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">My Account</p>
                        <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/customer-profile')}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  onClick={() => navigate(`/customer-auth?vendorId=${vendorId}&redirect=/storefront/${vendorId}`)}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
              {getTotalItems() > 0 && !showCheckout && (
                <Button
                  size="sm"
                  className="relative bg-white text-orange-600 hover:bg-white/90"
                  onClick={() => setShowCheckout(true)}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Cart
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                    {getTotalItems()}
                  </Badge>
                </Button>
              )}
            </div>
          </div>

          {vendor.address && (
            <div className="mt-3 flex items-center gap-2 text-sm text-white/90">
              <MapPin className="h-4 w-4" />
              <span>{vendor.address}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 md:px-0 -mt-6 py-10 space-y-6">
        {showCheckout ? (
          <CheckoutForm
            onBack={() => setShowCheckout(false)}
            onCheckout={handleCheckout}
          />
        ) : (
          <>
            {/* Active Orders Widget */}
            <div className="mb-6">
              <ActiveOrdersWidget vendorId={vendorId!} />
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4 bg-white rounded-2xl shadow-sm px-4 py-5">
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Quick filters row (Veg etc., inspired by Swiggy) */}
              <div className="flex flex-wrap gap-2 pt-3">
                <Button
                  type="button"
                  variant={onlyVeg ? "default" : "outline"}
                  className={`h-9 rounded-full px-4 text-sm font-medium flex items-center gap-2 ${
                    onlyVeg ? "bg-green-600 text-white border-transparent" : "border-gray-300 text-gray-700"
                  }`}
                  onClick={() => setOnlyVeg((v) => !v)}
                >
                  <span className="h-3 w-3 rounded-sm border border-green-600 flex items-center justify-center bg-white">
                    <span className="h-2 w-2 rounded-[2px] bg-green-600" />
                  </span>
                  Veg only
                </Button>
                {/* Placeholder chips for future filters */}
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-full px-4 text-sm font-medium border-gray-300 text-gray-700"
                  disabled
                >
                  Best rated (coming soon)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-full px-4 text-sm font-medium border-gray-300 text-gray-700"
                  disabled
                >
                  Offers (coming soon)
                </Button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              <p>{filteredProducts.length} delicious items available</p>
            </div>

            {/* Menu sections */}
            {!products || products.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No products available at the moment</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No products found</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {Object.entries(
                  filteredProducts.reduce<Record<string, any[]>>((groups, product) => {
                    const key = product.category || "Recommended";
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(product);
                    return groups;
                  }, {}),
                ).map(([category, items]) => (
                  <AccordionItem key={category} value={category} className="border-none">
                    <AccordionTrigger className="text-base font-semibold px-0">
                      <div className="flex items-center justify-between w-full">
                        <span>{category}</span>
                        <span className="text-xs text-muted-foreground">{items.length} items</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 px-0">
                      {items.map((product) => {
                        const quantity = getItemQuantity(product.id);
                        const isOutOfStock = product.stock_quantity !== null && product.stock_quantity <= 0;
                        const isLowStock =
                          product.stock_quantity !== null &&
                          product.stock_quantity > 0 &&
                          product.stock_quantity <= (product.low_stock_threshold || 0);
                        const maxQuantity = product.stock_quantity !== null ? product.stock_quantity : 999;
                        const canAddMore = quantity < maxQuantity;

                        return (
                          <div
                            key={product.id}
                            className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0"
                          >
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                {product.diet_type && (
                                  <span
                                    className={`h-3 w-3 rounded-sm border flex items-center justify-center bg-white ${
                                      product.diet_type === "veg" ? "border-green-600" : "border-red-600"
                                    }`}
                                  >
                                    <span
                                      className={`h-2 w-2 rounded-[2px] ${
                                        product.diet_type === "veg" ? "bg-green-600" : "bg-red-600"
                                      }`}
                                    />
                                  </span>
                                )}
                                <p className="font-medium text-sm">{product.name}</p>
                              </div>
                              <p className="text-sm font-semibold">₹{product.price}</p>
                              {product.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {product.description}
                                </p>
                              )}
                              {!isOutOfStock && product.stock_quantity !== null && (
                                <p className="text-[11px] text-muted-foreground">
                                  {product.stock_quantity} left
                                  {isLowStock ? " · Low stock" : ""}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {product.image_url && (
                                <div className="relative h-20 w-24 overflow-hidden rounded-xl bg-muted">
                                  <LazyImage
                                    src={product.image_url}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              {isOutOfStock ? (
                                <Button className="rounded-full px-5 h-8 text-xs" disabled>
                                  Out of Stock
                                </Button>
                              ) : quantity > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full h-8 w-8"
                                    onClick={() => removeFromCart(product.id)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="text-sm font-medium min-w-[2.5rem] text-center">
                                    {quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full h-8 w-8"
                                    disabled={!canAddMore}
                                    onClick={() => {
                                      if (canAddMore) {
                                        addToCart(product.id, {
                                          name: product.name,
                                          price: Number(product.price),
                                          image: product.image_url || undefined,
                                        });
                                      } else {
                                        toast.error(`Maximum available quantity: ${maxQuantity}`);
                                      }
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  className="rounded-full px-6 h-8 bg-orange-500 hover:bg-orange-600 text-white text-xs"
                                  onClick={() =>
                                    addToCart(product.id, {
                                      name: product.name,
                                      price: Number(product.price),
                                      image: product.image_url || undefined,
                                    })
                                  }
                                >
                                  ADD
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </>
        )}
      </main>

      {/* Floating Cart Summary */}
      {!showCheckout && <CartSummary onCheckout={() => setShowCheckout(true)} />}
    </div>
  );
}

