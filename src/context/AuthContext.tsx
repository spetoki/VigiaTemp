
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
      // Use demoUsers as a base, then try to overwrite with stored users
      let allUsers: User[] = demoUsers;
      if (storedUsers) {
        try {
          const parsed = JSON.parse(storedUsers);
          if (Array.isArray(parsed)) {
            allUsers = parsed;
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
    // This forces a login as 'admin' for debugging purposes.
    const adminUser = findUserByEmail('admin');
    if (adminUser) {
        const authDataToStore = { role: 'admin', email: 'admin' };
        try {
            localStorage.setItem(AUTH_KEY, JSON.stringify(authDataToStore));
        } catch(e) {
            console.error("Failed to set auth in localStorage", e);
        }
        setAuthState('admin');
        setCurrentUser(adminUser);
    } else {
        console.error("Could not find 'admin' user to force login. Falling back to default auth flow.");
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
          console.error("Auth init failed, logging out.", error);
          logout();
        }
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
