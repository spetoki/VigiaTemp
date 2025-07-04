
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { demoUsers } from '@/lib/mockData';

export type AuthState = 'unauthenticated' | 'user' | 'admin' | 'loading';

interface AuthContextType {
  authState: AuthState;
  currentUser: User | null;
  login: (role: 'user' | 'admin', email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'vigiatemp_auth';
const LS_USERS_KEY = 'vigiatemp_admin_users';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  const findUserByEmail = (email: string): User | null => {
    try {
      const storedUsers = localStorage.getItem(LS_USERS_KEY);
      const allUsers: User[] = storedUsers ? JSON.parse(storedUsers) : demoUsers;
      const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      return foundUser || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        const { role, email } = JSON.parse(storedAuth);
        if ((role === 'user' || role === 'admin') && email) {
          const fullUser = findUserByEmail(email);
          if (fullUser) {
            setAuthState(role);
            setCurrentUser(fullUser);
          } else {
            setAuthState('unauthenticated');
            setCurrentUser(null);
            localStorage.removeItem(AUTH_KEY);
          }
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
    const fullUser = findUserByEmail(email);
    if (!fullUser) {
      console.error("Login failed: could not find user details for", email);
      logout();
      return;
    }

    const authDataToStore = { role, email };
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(authDataToStore));
      setAuthState(role);
      setCurrentUser(fullUser);
    } catch (error) {
      console.error("Could not write to localStorage.", error);
      setAuthState(role);
      setCurrentUser(fullUser);
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
