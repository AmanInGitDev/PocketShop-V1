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
  }, [products, selectedCategory, searchQuery]);

  const handleCheckout = async (
    customerData: CheckoutFormData,
    paymentMethod: 'card' | 'upi' | 'wallet' | 'cash'
  ) => {
    try {
      // Get authenticated user if any
      const { data: { session } } = await supabase.auth.getSession();
      
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
            customerId: session?.user?.id || null,
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {vendor.logo_url && (
                <img
                  src={vendor.logo_url}
                  alt={vendor.business_name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{vendor.business_name}</h1>
                {vendor.description && (
                  <p className="text-sm text-muted-foreground">{vendor.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" title="Account">
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
                  onClick={() => navigate(`/customer-auth?vendorId=${vendorId}&redirect=/storefront/${vendorId}`)}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
              {getTotalItems() > 0 && !showCheckout && (
                <Button size="lg" className="relative" onClick={() => setShowCheckout(true)}>
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
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{vendor.address}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {showCheckout ? (
          <CheckoutForm
            onBack={() => setShowCheckout(false)}
            onCheckout={handleCheckout}
          />
        ) : (
          <>
            {/* Active Orders Widget */}
            <div className="mb-8">
              <ActiveOrdersWidget vendorId={vendorId!} />
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="relative max-w-md">
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

              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All Products
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              {searchQuery || selectedCategory !== "all" ? (
                <p>
                  Showing {filteredProducts.length} of {products?.length || 0} products
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              ) : (
                <p>{products?.length || 0} products available</p>
              )}
            </div>
            
            {/* Products Grid */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const quantity = getItemQuantity(product.id);
                  const isOutOfStock = product.stock_quantity !== null && product.stock_quantity <= 0;
                  const isLowStock = product.stock_quantity !== null && product.stock_quantity > 0 && product.stock_quantity <= (product.low_stock_threshold || 0);
                  const maxQuantity = product.stock_quantity !== null ? product.stock_quantity : 999;
                  const canAddMore = quantity < maxQuantity;
                  
                  return (
                     <Card key={product.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${isOutOfStock ? 'opacity-60' : ''}`}>
                      {product.image_url && (
                        <div className="relative">
                          <LazyImage
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Badge variant="destructive" className="text-lg px-4 py-2">
                                Out of Stock
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">₹{product.price}</span>
                          <div className="flex flex-col items-end gap-1">
                            {product.category && (
                              <Badge variant="secondary">{product.category}</Badge>
                            )}
                            {!isOutOfStock && product.stock_quantity !== null && (
                              <Badge variant={isLowStock ? "destructive" : "outline"} className="text-xs">
                                {product.stock_quantity} in stock
                              </Badge>
                            )}
                          </div>
                        </div>

                        {isOutOfStock ? (
                          <Button className="w-full" disabled>
                            Out of Stock
                          </Button>
                        ) : quantity > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeFromCart(product.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-medium px-4 min-w-[3rem] text-center">
                              {quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
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
                              title={!canAddMore ? 'Maximum quantity reached' : 'Add one more'}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="w-full"
                            onClick={() =>
                              addToCart(product.id, {
                                name: product.name,
                                price: Number(product.price),
                                image: product.image_url || undefined,
                              })
                            }
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Cart Summary */}
      {!showCheckout && <CartSummary onCheckout={() => setShowCheckout(true)} />}
    </div>
  );
}

