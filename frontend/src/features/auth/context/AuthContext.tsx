/**
 * Authentication Context
 * 
 * This context provides authentication state and methods throughout the app.
 * It manages user sessions, login/logout functionality, and user data.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User, AuthState } from '@/features/common/types';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userData: { full_name: string; mobile_number?: string; role: 'vendor' | 'customer' }) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Force stop loading after maximum 15 seconds - safety net
  useEffect(() => {
    const forceStopTimer = setTimeout(() => {
      if (loading) {
        console.warn('Force stopping loading after 15 second timeout');
        setLoading(false);
        setError('Connection timeout. Please refresh the page.');
      }
    }, 15000);

    return () => clearTimeout(forceStopTimer);
  }, [loading]);

  useEffect(() => {
    // Get initial session with timeout
    const getInitialSession = async () => {
      let session: any = null;
      try {
        // Check if Supabase is properly configured
        if (!supabase) {
          console.warn('Supabase client not initialized');
          setLoading(false);
          return;
        }
        
        console.log('Getting session...');
        
        // Get session directly - if it hangs, the force stop timer will catch it
        const sessionResponse = await supabase.auth.getSession();
        session = sessionResponse.data?.session || null;
        
        if (sessionResponse.error) {
          console.error('Error getting session:', sessionResponse.error);
          setError(sessionResponse.error.message);
          setLoading(false);
          return;
        }
        
        console.log('Session result:', session?.user?.id ? 'User logged in' : 'No session');
        
        // If no session, user is not logged in - stop loading immediately
        if (!session?.user) {
          console.log('No session found, user not logged in');
          setUser(null);
          setLoading(false);
          return;
        }

        // User has session - fetch profile but don't block on it
        // Set loading to false quickly, profile can load in background
        console.log('Session found, fetching vendor profile...');
        setLoading(false); // Stop loading immediately - we have a session
        
        // Fetch vendor profile data - don't block if it fails
        try {
          // Query profile with a reasonable timeout
          const profilePromise = supabase
            .from('vendor_profiles')
            .select('*')
            .eq('user_id', session!.user.id)
            .single();
          
          // Set a timeout for profile query (3 seconds)
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile query timeout')), 3000)
          );
          
          const { data: vendorProfile, error: profileError } = await Promise.race([
            profilePromise,
            timeoutPromise
          ]) as any;

          if (profileError) {
            console.log('Profile error:', profileError.code, profileError.message);
            
            // If vendor profile doesn't exist, create it (for users added directly in Supabase)
            if (profileError.code === 'PGRST116') {
              console.log('Profile not found, creating new vendor profile...');
              const userMetadata = session.user.user_metadata || {};
              
              // Try to create vendor profile directly
              // Note: This requires user_roles entry to exist (created by trigger or manually)
              // If this fails due to missing role, we'll set user anyway and let onboarding handle it
              const { error: createError } = await supabase
                .from('vendor_profiles')
                .insert([
                  {
                    user_id: session.user.id,
                    email: session.user.email || '',
                    business_name: userMetadata.business_name || userMetadata.full_name || session.user.email?.split('@')[0] || 'My Business',
                    mobile_number: userMetadata.mobile_number || '',
                    owner_name: userMetadata.full_name || userMetadata.name || session.user.email?.split('@')[0] || 'Vendor',
                    onboarding_status: 'incomplete',
                  },
                ]);

              if (createError) {
                console.error('Error creating vendor profile:', createError);
                console.log('Note: If profile creation fails, user_roles entry may be missing. Profile will be created during onboarding.');
                // Still set basic user info - profile can be created during onboarding
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.email?.split('@')[0] || 'Vendor',
                  role: 'vendor',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
              } else {
                // Fetch the newly created profile
                const { data: newProfile } = await supabase
                  .from('vendor_profiles')
                  .select('*')
                  .eq('user_id', session.user.id)
                  .single();
                
                if (newProfile) {
                  // Map vendor_profiles to User type
                  setUser({
                    id: newProfile.user_id,
                    email: newProfile.email,
                    full_name: newProfile.owner_name || newProfile.business_name || 'Vendor',
                    avatar_url: newProfile.logo_url || undefined,
                    role: 'vendor',
                    created_at: newProfile.created_at,
                    updated_at: newProfile.updated_at,
                  });
                }
              }
            } else {
              console.error('Error fetching vendor profile:', profileError);
              // If RLS policy issue or other error, still allow login with basic info
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.email?.split('@')[0] || 'Vendor',
                role: 'vendor',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          } else if (vendorProfile) {
            // Map vendor_profiles to User type
            setUser({
              id: vendorProfile.user_id,
              email: vendorProfile.email,
              full_name: vendorProfile.owner_name || vendorProfile.business_name || 'Vendor',
              avatar_url: vendorProfile.logo_url || undefined,
              role: 'vendor',
              created_at: vendorProfile.created_at,
              updated_at: vendorProfile.updated_at,
            });
          }
        } catch (profileErr) {
          console.error('Exception fetching vendor profile:', profileErr);
          // Still allow login with basic info - profile can load later
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.email?.split('@')[0] || 'Vendor',
            role: 'vendor',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
        // If we have a session, still set user
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.email?.split('@')[0] || 'Vendor',
            role: 'vendor',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        setLoading(false);
      }
      // Loading already set to false above when session found
    };

    getInitialSession();

    // Listen for auth changes
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('Auth state changed:', event, session?.user?.id);
          
          // Skip handling if this is just the initial session check - already handled above
          if (event === 'INITIAL_SESSION') {
            return;
          }
          
          // Handle OAuth callback redirects
          if (event === 'SIGNED_IN' && session?.user) {
            // Check if this is an OAuth callback
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('code') || window.location.hash.includes('access_token')) {
              // Clear URL params after OAuth
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
          
          if (session?.user) {
            // Stop loading immediately - we have a session
            setLoading(false);
            
            // Set user immediately from session (non-blocking)
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Vendor',
              role: 'vendor',
              created_at: session.user.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            
            // Load profile in background (non-blocking) - don't await
            (async () => {
              try {
                // Check if vendor profile exists, create if it doesn't (for OAuth and OTP users)
                const { data: vendorProfile, error: profileError } = await supabase
                  .from('vendor_profiles')
                  .select('*')
                  .eq('user_id', session.user.id)
                  .single();

                // If vendor profile doesn't exist, create one (for OAuth/OTP users)
                if (profileError && profileError.code === 'PGRST116') {
                  // Profile doesn't exist, create it
                  const userMetadata = session.user.user_metadata || {};
                
                  // Try to create vendor profile directly
                  // Note: This requires user_roles entry to exist (created by trigger or manually)
                  // If this fails due to missing role, we'll set user anyway and let onboarding handle it
                  const { error: createError } = await supabase
                    .from('vendor_profiles')
                    .insert([
                      {
                        user_id: session.user.id,
                        email: session.user.email || '',
                        business_name: userMetadata.business_name || userMetadata.full_name || session.user.email?.split('@')[0] || 'My Business',
                        mobile_number: userMetadata.mobile_number || '',
                        owner_name: userMetadata.full_name || userMetadata.name || session.user.email?.split('@')[0] || 'Vendor',
                        onboarding_status: 'incomplete',
                      },
                    ]);

                  if (createError) {
                    console.error('Error creating vendor profile:', createError);
                    console.log('Note: If profile creation fails, user_roles entry may be missing. Profile will be created during onboarding.');
                    // Profile creation failed, but user is already set from session above
                  } else {
                    // Fetch the newly created profile and update user
                    const { data: newProfile } = await supabase
                      .from('vendor_profiles')
                      .select('*')
                      .eq('user_id', session.user.id)
                      .single();
                    
                    if (newProfile) {
                      // Update user with full profile data
                      setUser({
                        id: newProfile.user_id,
                        email: newProfile.email,
                        full_name: newProfile.owner_name || newProfile.business_name || 'Vendor',
                        avatar_url: newProfile.logo_url || undefined,
                        role: 'vendor',
                        created_at: newProfile.created_at,
                        updated_at: newProfile.updated_at,
                      });
                      setError(null);
                      
                      // Don't redirect here - let VendorAuth handle redirects to prevent loops
                    }
                  }
                } else if (profileError) {
                  console.error('Error fetching vendor profile:', profileError);
                  // Profile fetch failed, but user is already set from session above
                } else if (vendorProfile) {
                  // Update user with full profile data
                  setUser({
                    id: vendorProfile.user_id,
                    email: vendorProfile.email,
                    full_name: vendorProfile.owner_name || vendorProfile.business_name || 'Vendor',
                    avatar_url: vendorProfile.logo_url || undefined,
                    role: 'vendor',
                    created_at: vendorProfile.created_at,
                    updated_at: vendorProfile.updated_at,
                  });
                  setError(null);
                  
                  // Don't redirect here - let VendorAuth or other components handle redirects
                  // This prevents infinite reload loops
                  // The redirect will be handled by VendorAuth useEffect or login handler
                }
              } catch (profileErr: any) {
                console.error('Exception in profile fetch/creation:', profileErr);
                // User is already set from session above, so no need to set again
              }
            })(); // End of background profile loading
          } else {
            setUser(null);
            setError(null);
            setLoading(false);
          }
        } catch (err) {
          console.error('Error in auth state change:', err);
          setError('An error occurred during authentication');
          setLoading(false);
          // Clear user on error
          setUser(null);
        }
      }
    );

    return () => {
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

      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
        return { error };
      }

      setUser(null);
      return { error: null };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during signout';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
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

