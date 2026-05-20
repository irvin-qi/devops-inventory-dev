import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { env } from '../config/env';
import type { AuthUser } from '../api/interfaces/IAuthService';
import type { Manager } from '../types';
import { MANAGERS } from '../data/mockData';

interface AuthContextValue {
  user: AuthUser | null;
  currentManager: Manager;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if Supabase is configured
  const isSupabaseConfigured = Boolean(env.supabase.url && env.supabase.anonKey);

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // No Supabase - skip auth, use mock manager
      console.log('Auth: Using mock manager (Supabase not configured)');
      setIsLoading(false);
      return;
    }

    // Supabase is configured - use real auth
    import('../api').then(({ getApiServices }) => {
      const services = getApiServices();

      // Check for existing session
      services.auth.getCurrentUser().then((result) => {
        if (result.status === 'success') {
          setUser(result.data);
        }
        setIsLoading(false);
      });

      // Subscribe to auth state changes
      const unsubscribe = services.auth.onAuthStateChange((authUser) => {
        setUser(authUser);
      });

      return () => {
        unsubscribe();
      };
    });
  }, [isSupabaseConfigured]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Authentication not configured' };
    }

    const { getApiServices } = await import('../api');
    const services = getApiServices();
    const result = await services.auth.signIn({ email, password });

    if (result.status === 'success' && result.data) {
      setUser(result.data);
      return { success: true };
    }

    return { success: false, error: result.error?.message || 'Sign in failed' };
  }, [isSupabaseConfigured]);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return;
    }

    const { getApiServices } = await import('../api');
    const services = getApiServices();
    await services.auth.signOut();
    setUser(null);
  }, [isSupabaseConfigured]);

  // Use mock manager when not authenticated or Supabase not configured
  const currentManager = user?.manager || MANAGERS[0];

  const value: AuthContextValue = {
    user,
    currentManager,
    isLoading,
    isAuthenticated: user !== null,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
