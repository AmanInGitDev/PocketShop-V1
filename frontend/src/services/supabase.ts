/**
 * Supabase Configuration and Client Setup
 * 
 * This file handles the connection to Supabase backend services including:
 * - Database connection
 * - Authentication
 * - Real-time subscriptions
 * - Storage for images
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Environment variables for Supabase configuration
// These should be set in your .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug logging
console.log('Supabase Config:', {
  url: supabaseUrl ? '✓ Set' : '✗ Missing',
  key: supabaseAnonKey ? '✓ Set' : '✗ Missing',
});

// Validate that required environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
  // Don't throw error, just log warning - allows app to load
}

/**
 * Create Supabase client instance
 * 
 * This client will be used throughout the application for:
 * - Database operations (CRUD)
 * - User authentication
 * - Real-time subscriptions
 * - File storage
 */
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
  auth: {
    // Automatically refresh tokens
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session from URL (for OAuth callbacks)
    detectSessionInUrl: true,
  },
  // Enable real-time subscriptions
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Database helper functions
 * These provide type-safe database operations
 */

// ===== AUTHENTICATION HELPERS =====

/**
 * Sign up a new user
 */
export const signUp = async (email: string, password: string, userData: {
  full_name: string;
  role: 'vendor' | 'customer';
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
};

/**
 * Sign in an existing user
 */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/vendor/dashboard`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  return { data, error };
};

/**
 * Send OTP to phone number
 */
export const sendOTP = async (phone: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'sms',
    },
  });
  return { data, error };
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (phone: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  return { data, error };
};

/**
 * Get current user session
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// ===== BUSINESS HELPERS =====

/**
 * Create a new business
 */
export const createBusiness = async (businessData: {
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  qr_code: string;
}) => {
  const { data, error } = await supabase
    .from('businesses')
    .insert([businessData])
    .select()
    .single();
  return { data, error };
};

/**
 * Get business by ID
 */
export const getBusiness = async (id: string) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};

/**
 * Get business by QR code
 */
export const getBusinessByQR = async (qrCode: string) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('qr_code', qrCode)
    .eq('is_active', true)
    .single();
  return { data, error };
};

/**
 * Update business information
 */
export const updateBusiness = async (id: string, updates: Partial<{
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string;
  banner_url: string;
}>) => {
  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// ===== PRODUCT HELPERS =====

/**
 * Get products for a business
 */
export const getProducts = async (businessId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_available', true)
    .order('created_at', { ascending: true });
  return { data, error };
};

/**
 * Create a new product
 */
export const createProduct = async (productData: {
  business_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  preparation_time?: number;
}) => {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();
  return { data, error };
};

/**
 * Update product information
 */
export const updateProduct = async (id: string, updates: Partial<{
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
  preparation_time: number;
}>) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// ===== ORDER HELPERS =====

/**
 * Create a new order
 */
export const createOrder = async (orderData: {
  business_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  total_amount: number;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    special_instructions?: string;
  }>;
  notes?: string;
}) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();
  return { data, error };
};

/**
 * Get orders for a business
 */
export const getOrders = async (businessId: string, status?: string) => {
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('business_id', businessId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
};

/**
 * Update order status
 */
export const updateOrderStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// ===== STORAGE HELPERS =====

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);
  return { data, error };
};

/**
 * Get public URL for uploaded file
 */
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Delete file from storage
 */
export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  return { error };
};

// ===== REAL-TIME SUBSCRIPTIONS =====

/**
 * Subscribe to order updates for a business
 */
export const subscribeToOrders = (
  businessId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `business_id=eq.${businessId}`,
      },
      callback
    )
    .subscribe();
};

/**
 * Subscribe to product updates for a business
 */
export const subscribeToProducts = (
  businessId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('products')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products',
        filter: `business_id=eq.${businessId}`,
      },
      callback
    )
    .subscribe();
};

// Export the supabase client as default for direct use
export default supabase;
