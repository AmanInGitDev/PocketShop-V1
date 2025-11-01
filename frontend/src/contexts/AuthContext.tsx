/**
 * Authentication Context
 * 
 * This context provides authentication state and methods throughout the app.
 * It manages user sessions, login/logout functionality, and user data.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userData: { full_name: string; role: 'vendor' | 'customer' }) => Promise<{ data: any; error: any }>;
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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check if Supabase is properly configured
        if (!supabase) {
          console.warn('Supabase client not initialized');
          setLoading(false);
          return;
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
        } else if (session?.user) {
          // Fetch user profile data
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            setError(profileError.message);
          } else {
            setUser({
              ...profile,
              avatar_url: profile.avatar_url || undefined,
            });
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          // Check if user profile exists, create if it doesn't (for OAuth and OTP users)
          let { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          // If profile doesn't exist, create one (for OAuth/OTP users)
          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const userMetadata = session.user.user_metadata || {};
            const { error: createError } = await supabase
              .from('users')
              .insert([
                {
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: userMetadata.full_name || userMetadata.name || session.user.email?.split('@')[0] || 'Vendor',
                  role: userMetadata.role || 'vendor',
                  avatar_url: userMetadata.avatar_url || userMetadata.picture || null,
                },
              ]);

            if (createError) {
              console.error('Error creating user profile:', createError);
              setError(createError.message);
              setUser(null);
            } else {
              // Fetch the newly created profile
              const { data: newProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (newProfile) {
                setUser({
                  ...newProfile,
                  avatar_url: newProfile.avatar_url || undefined,
                });
                setError(null);
              }
            }
          } else if (profileError) {
            console.error('Error fetching user profile:', profileError);
            setError(profileError.message);
            setUser(null);
          } else if (profile) {
            setUser({
              ...profile,
              avatar_url: profile.avatar_url || undefined,
            });
            setError(null);
          }
        } else {
          setUser(null);
          setError(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: { full_name: string; role: 'vendor' | 'customer' }) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        setError(error.message);
        return { data: null, error };
      }

      // If signup is successful, create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email!,
              full_name: userData.full_name,
              role: userData.role,
            },
          ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          setError(profileError.message);
          return { data, error: profileError };
        }
      }

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

