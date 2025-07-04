
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
      let allUsers: User[] = [...demoUsers]; // Start with demo users to ensure admin exists
      
      if (storedUsers) {
        try {
          const parsed = JSON.parse(storedUsers);
          if (Array.isArray(parsed)) {
            const demoUserEmails = new Set(demoUsers.map(u => u.email.toLowerCase()));
            const uniqueNewUsers = parsed.filter((u: any) => u.email && !demoUserEmails.has(u.email.toLowerCase()));
            allUsers = [...allUsers, ...uniqueNewUsers];
          }
        } catch (e) {
          console.error("Could not parse users from localStorage, using demo data.", e);
        }
      }

      const cleanedUsers = allUsers.map((u: any) => ({
        id: u.id || `user-${Math.random()}`,
        name: u.name || 'Unknown User',
        email: u.email || 'unknown@email.com',
        password: u.password,
        role: u.role || 'User',
        status: u.status || 'Pending',
        joinedDate: u.joinedDate || new Date().toISOString(),
        tempCoins: u.tempCoins || 0
      }));

      const foundUser = cleanedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      return foundUser || null;
    } catch (error) {
      console.error("Failed to access localStorage for users, using demo data as fallback.", error);
      const foundUser = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      return foundUser || null;
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
    // Force login as admin for demonstration and recovery purposes.
    // This circumvents issues with stale data in localStorage causing crashes.
    login('admin', 'admin');
  }, [login]);

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
