/**
 * Authentication Context
 * 
 * This context provides authentication state and methods throughout the app.
 * It manages user sessions, login/logout functionality, and user data.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User, AuthState } from '@/features/common/types';
import type { Session } from '@supabase/supabase-js';

export type OnboardingStatusValue = 'incomplete' | 'basic_info' | 'operational_details' | 'planning_selected' | 'completed';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userData: { full_name: string; mobile_number?: string; role: 'vendor' | 'customer' }) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  session: Session | null;
  /** Cached onboarding status (set after login from vendor profile). Use this to avoid checking on every navigation. */
  onboardingStatus: OnboardingStatusValue | null;
  /** Update cached onboarding status (e.g. after completing a stage). */
  setOnboardingStatus: (status: OnboardingStatusValue | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatusValue | null>(null);

  // Helper function to load vendor profile (non-blocking)
  const loadVendorProfile = async (userId: string, sessionUser: any) => {
    try {
      // Note: vendor_profiles table exists but is not in TypeScript database types yet
      const { data: vendorProfile, error: profileError } = await (supabase
        .from('vendor_profiles' as any)
        .select('*')
        .eq('user_id', userId)
        .single()) as any;

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Profile not found, creating new vendor profile...');
        const userMetadata = sessionUser.user_metadata || {};
        
        // Note: vendor_profiles table exists but is not in TypeScript database types yet
        const { error: createError } = await (supabase
          .from('vendor_profiles' as any)
          .insert([
            {
              user_id: userId,
              email: sessionUser.email || '',
              business_name: userMetadata.business_name || userMetadata.full_name || sessionUser.email?.split('@')[0] || 'My Business',
              mobile_number: userMetadata.mobile_number || '',
              owner_name: userMetadata.full_name || userMetadata.name || sessionUser.email?.split('@')[0] || 'Vendor',
              onboarding_status: 'incomplete',
            },
          ])) as any;

        if (createError) {
          console.error('Error creating vendor profile:', createError);
          // Fall back to basic user info
          return null;
        } else {
          // Fetch the newly created profile
          const { data: newProfile } = await (supabase
            .from('vendor_profiles' as any)
            .select('*')
            .eq('user_id', userId)
            .single()) as any;
          
          return newProfile;
        }
      } else if (profileError) {
        console.error('Error fetching vendor profile:', profileError);
        return null;
      }

      return vendorProfile;
    } catch (err) {
      console.error('Exception loading vendor profile:', err);
      return null;
    }
  };

  // Helper function to map session/user to User type
  const mapSessionToUser = (session: Session | null, vendorProfile?: any): User | null => {
    if (!session?.user) {
      return null;
    }

    if (vendorProfile) {
      return {
        id: vendorProfile.user_id,
        email: vendorProfile.email,
        full_name: vendorProfile.owner_name || vendorProfile.business_name || 'Vendor',
        avatar_url: vendorProfile.logo_url || undefined,
        role: 'vendor',
        created_at: vendorProfile.created_at,
        updated_at: vendorProfile.updated_at,
      };
    }

    // Fallback to session user data
    const userMetadata = session.user.user_metadata || {};
    return {
      id: session.user.id,
      email: session.user.email || '',
      full_name: userMetadata.full_name || userMetadata.name || session.user.email?.split('@')[0] || 'Vendor',
      role: 'vendor',
      created_at: session.user.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  // Main effect for session management and auth state
  useEffect(() => {
    let mounted = true;

    // Timeout: if getSession() hangs (e.g. Supabase paused/slow), show app so user can reach login
    const AUTH_INIT_TIMEOUT_MS = 10_000;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const clearLoadingIfMounted = () => {
      if (mounted) {
        setLoading(false);
      }
    };

    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('[Auth] Initial session check timed out – showing app. You can try logging in.');
        setLoading(false);
      }
    }, AUTH_INIT_TIMEOUT_MS);

    // Check for active session on mount
    const initializeAuth = async () => {
      try {
        // Check if Supabase is properly configured
        if (!supabase) {
          console.warn('Supabase client not initialized');
          clearLoadingIfMounted();
          return;
        }

        // Get initial session from Supabase (uses localStorage automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (timeoutId != null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (mounted) {
            setError(sessionError.message);
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setSession(session);
          
          if (session?.user) {
            // Set user immediately from session (fast path)
            const basicUser = mapSessionToUser(session);
            setUser(basicUser);
            setLoading(false);

            // Load vendor profile in background (non-blocking); cache onboarding status once after login
            loadVendorProfile(session.user.id, session.user).then((vendorProfile) => {
              if (mounted) {
                if (vendorProfile) {
                  const fullUser = mapSessionToUser(session, vendorProfile);
                  if (fullUser) setUser(fullUser);
                  setOnboardingStatus((vendorProfile as any).onboarding_status ?? 'incomplete');
                } else {
                  setOnboardingStatus('incomplete');
                }
              }
            });
          } else {
            // No session found
            setUser(null);
            setLoading(false);
          }
        }
      } catch (err) {
        if (timeoutId != null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        console.error('Unexpected error during auth initialization:', err);
        if (mounted) {
          setError('An unexpected error occurred during authentication');
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes (login, logout, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);

        // Handle token refresh
        if (event === 'TOKEN_REFRESHED') {
          if (session) {
            setSession(session);
            // User state remains the same, just update session
          }
          return;
        }

        // Handle sign out
        if (event === 'SIGNED_OUT' || !session?.user) {
          setSession(null);
          setUser(null);
          setOnboardingStatus(null);
          setError(null);
          setLoading(false);
          return;
        }

        // Handle sign in or session restored
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          // Handle OAuth callback redirects
          if (event === 'SIGNED_IN') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('code') || window.location.hash.includes('access_token')) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }

          setSession(session);
          setLoading(false);

          // Set user immediately from session
          const basicUser = mapSessionToUser(session);
          setUser(basicUser);

          // Load vendor profile in background; cache onboarding status once after login
          loadVendorProfile(session.user.id, session.user).then((vendorProfile) => {
            if (mounted) {
              if (vendorProfile) {
                const fullUser = mapSessionToUser(session, vendorProfile);
                if (fullUser) setUser(fullUser);
                setOnboardingStatus((vendorProfile as any).onboarding_status ?? 'incomplete');
              } else {
                setOnboardingStatus('incomplete');
              }
            }
          });
        }
      }
    );

    return () => {
      mounted = false;
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: { full_name: string; mobile_number?: string; role: 'vendor' | 'customer' }) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            user_type: userData.role, // Trigger expects user_type, not role
            business_name: userData.full_name, // Trigger expects business_name for vendors
            mobile_number: userData.mobile_number || '', // Pass mobile number to metadata
          },
          emailRedirectTo: `${window.location.origin}/vendor/onboarding/stage-1`,
        },
      });

      if (error) {
        setError(error.message);
        return { data: null, error };
      }

      // Note: Profile creation is handled by database trigger based on user_type metadata
      // If trigger fails, the profile will be created on next login attempt by AuthContext useEffect
      return { data, error: null };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during signup';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during signin';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      // Sign out from Supabase (this will clear the session and localStorage)
      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
        return { error };
      }

      // Clear local state
      setSession(null);
      setUser(null);
      setOnboardingStatus(null);

      // Clear any additional localStorage items if needed
      // (Supabase automatically handles its own session storage)
      
      return { error: null };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during signout';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  // Expose debug variables for troubleshooting
  useEffect(() => {
    (window as any).__DEBUG_AUTH_LOADING = loading;
  }, [loading]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    onboardingStatus,
    setOnboardingStatus,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

