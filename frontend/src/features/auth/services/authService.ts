/**
 * Authentication Service
 * 
 * Handles all authentication-related operations
 */

import { supabase } from '@/lib/supabaseClient';

export const signUp = async (email: string, password: string, userData: {
  full_name: string;
  mobile_number?: string;
  role: 'vendor' | 'customer';
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...userData,
        user_type: userData.role, // Trigger expects user_type, not role
        business_name: userData.full_name, // For vendors
        mobile_number: userData.mobile_number || '', // Pass mobile number to metadata
      },
      emailRedirectTo: `${window.location.origin}/vendor/onboarding/stage-1`,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/business`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  return { data, error };
};

export const sendOTP = async (phone: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'sms',
    },
  });
  return { data, error };
};

export const verifyOTP = async (phone: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
    options: {
      redirectTo: `${window.location.origin}/vendor/onboarding/stage-1`,
    },
  });
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

