import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiServices } from '../api';
import type { AuthUser } from '../api/interfaces/IAuthService';
import type { Manager } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  currentManager: Manager | null;
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

  // Initialize auth state
  useEffect(() => {
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
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const services = getApiServices();
    const result = await services.auth.signIn({ email, password });

    if (result.status === 'success' && result.data) {
      setUser(result.data);
      return { success: true };
    }

    return { success: false, error: result.error?.message || 'Sign in failed' };
  }, []);

  const signOut = useCallback(async () => {
    const services = getApiServices();
    await services.auth.signOut();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    currentManager: user?.manager || null,
    isLoading,
    isAuthenticated: user !== null,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
