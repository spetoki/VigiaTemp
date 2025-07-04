
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

  const findUserByEmail = useCallback((email: string): User | null => {
    try {
      const storedUsers = localStorage.getItem(LS_USERS_KEY);
      let allUsers: User[] = storedUsers ? JSON.parse(storedUsers) : demoUsers;

      allUsers = allUsers.map((u: any) => ({
        id: u.id, name: u.name, email: u.email, password: u.password,
        role: u.role, status: u.status, joinedDate: u.joinedDate, tempCoins: u.tempCoins
      }));

      const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      return foundUser || null;
    } catch {
      return null;
    }
  }, []);

  const login = useCallback((role: 'user' | 'admin', email: string) => {
    const fullUser = findUserByEmail(email);
    if (!fullUser) {
      console.error("Login failed: could not find user details for", email);
      try { localStorage.removeItem(AUTH_KEY); } catch (e) {}
      setAuthState('unauthenticated');
      setCurrentUser(null);
      router.push('/login');
      return;
    }

    const authDataToStore = { role, email };
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(authDataToStore));
    } catch (error) {
      console.error("Could not write to localStorage.", error);
    }
    setAuthState(role);
    setCurrentUser(fullUser);
  }, [router, findUserByEmail]);

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

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        const { role, email } = JSON.parse(storedAuth);
        const userDetails = findUserByEmail(email);
        if (userDetails && userDetails.status === 'Active') {
          setAuthState(role);
          setCurrentUser(userDetails);
        } else {
          logout();
        }
      } else {
        setAuthState('unauthenticated');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Auth init failed:", error);
      setAuthState('unauthenticated');
      setCurrentUser(null);
    }
  }, [findUserByEmail, logout]);

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
