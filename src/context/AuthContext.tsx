
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export type AuthState = 'unauthenticated' | 'user' | 'admin' | 'loading';

interface CurrentUser {
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  authState: AuthState;
  currentUser: CurrentUser | null;
  login: (role: 'user' | 'admin', email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'vigiatemp_auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        const { role, email } = JSON.parse(storedAuth);
        if ((role === 'user' || role === 'admin') && email) {
          setAuthState(role);
          setCurrentUser({ role, email });
        } else {
          setAuthState('unauthenticated');
          setCurrentUser(null);
        }
      } else {
        setAuthState('unauthenticated');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Could not access localStorage. Defaulting to unauthenticated.", error);
      setAuthState('unauthenticated');
      setCurrentUser(null);
    }
  }, []);

  const login = useCallback((role: 'user' | 'admin', email: string) => {
    const userToStore = { role, email };
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(userToStore));
      setAuthState(role);
      setCurrentUser(userToStore);
    } catch (error) {
      console.error("Could not write to localStorage.", error);
      // Fallback to memory state if localStorage fails
      setAuthState(role);
      setCurrentUser(userToStore);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.error("Could not remove from localStorage.", error);
    }
    setAuthState('unauthenticated');
    setCurrentUser(null);
    router.push('/login');
  }, [router]);

  const value = { authState, currentUser, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
