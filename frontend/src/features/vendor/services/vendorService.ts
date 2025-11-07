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

