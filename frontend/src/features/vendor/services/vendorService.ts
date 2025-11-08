/**
 * Vendor Service
 * 
 * Handles all vendor-related operations
 */

import { supabase } from '@/lib/supabaseClient';

export const getVendorProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

export const updateVendorProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  return { data, error };
};

/**
 * Toggle vendor online/offline status
 * This controls whether the vendor can receive new orders
 */
export const toggleVendorStatus = async (userId: string, isActive: boolean) => {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .update({ 
      is_active: isActive,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select('is_active')
    .single();
  
  return { data, error };
};

/**
 * Get vendor online status
 */
export const getVendorStatus = async (userId: string) => {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .select('is_active')
    .eq('user_id', userId)
    .single();
  
  return { data: data?.is_active ?? false, error };
};

