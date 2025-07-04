
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
      let allUsers: User[] = storedUsers ? JSON.parse(storedUsers) : demoUsers;

      // Clean the stored data to ensure it matches the current User type
      allUsers = allUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        status: u.status,
        joinedDate: u.joinedDate,
        tempCoins: u.tempCoins
      }));

      const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      return foundUser || null;
    } catch {
      return null;
    }
  };

  const login = useCallback((role: 'user' | 'admin', email: string) => {
    const fullUser = findUserByEmail(email);
    if (!fullUser) {
      console.error("Login failed: could not find user details for", email);
      // Don't call logout here to avoid dependency cycle
      try {
        localStorage.removeItem(AUTH_KEY);
      } catch (error) {
        console.error("Could not remove from localStorage.", error);
      }
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
  }, [router]);

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
    // This logic forcefully logs in 'spetoki@gmail.com' for testing purposes.
    // It overrides any existing session.
    try {
      const emailToLogin = 'spetoki@gmail.com';
      const userToLogin = findUserByEmail(emailToLogin);

      if (userToLogin) {
        const role = userToLogin.role.toLowerCase() as 'user' | 'admin';
        const authData = { role, email: emailToLogin };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        setAuthState(role);
        setCurrentUser(userToLogin);
      } else {
        // If spetoki@gmail.com is not found, default to unauthenticated state.
        setAuthState('unauthenticated');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Could not access localStorage. Defaulting to unauthenticated.", error);
      setAuthState('unauthenticated');
      setCurrentUser(null);
    }
  }, []); // Empty dependency array ensures this runs only once on mount.

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
    
