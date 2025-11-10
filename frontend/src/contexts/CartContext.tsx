/**
 * Cart Context
 * 
 * Provides cart state management for the application.
 * Stores cart data in localStorage for persistence.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image?: string;
}

interface CartContextType {
  cart: { [key: string]: number };
  cartItems: CartItem[];
  addToCart: (productId: string, product: { name: string; price: number; image?: string }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  deleteFromCart: (productId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'pocketshop_cart';
const CART_ITEMS_STORAGE_KEY = 'pocketshop_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load cart from localStorage on mount
  const [cart, setCart] = useState<{ [key: string]: number }>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : {};
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return {};
    }
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedItems = localStorage.getItem(CART_ITEMS_STORAGE_KEY);
      return savedItems ? JSON.parse(savedItems) : [];
    } catch (error) {
      console.error('Error loading cart items from localStorage:', error);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      localStorage.setItem(CART_ITEMS_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart, cartItems]);

  const addToCart = (
    productId: string,
    product: { name: string; price: number; image?: string }
  ) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));

    // Update cart items with product details
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.productId === productId);
      if (existingItem) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            productId,
            quantity: 1,
            name: product.name,
            price: product.price,
            image: product.image,
          },
        ];
      }
    });

    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.productId === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter((item) => item.productId !== productId);
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      deleteFromCart(productId);
      return;
    }

    if (quantity > 1000) {
      toast.error('Maximum quantity is 1000');
      return;
    }

    setCart((prev) => ({
      ...prev,
      [productId]: quantity,
    }));

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const deleteFromCart = (productId: string) => {
    const item = cartItems.find((item) => item.productId === productId);
    
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });

    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    
    if (item) {
      toast.success(`${item.name} removed from cart`);
    }
  };

  const clearCart = () => {
    setCart({});
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CART_ITEMS_STORAGE_KEY);
    toast.success('Cart cleared');
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const getTotalAmount = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const isInCart = (productId: string) => {
    return productId in cart;
  };

  const getItemQuantity = (productId: string) => {
    return cart[productId] || 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        deleteFromCart,
        clearCart,
        getTotalItems,
        getTotalAmount,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
