
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, AuthState } from '@/types';
import { demoUsers } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from './SettingsContext';

interface AuthContextType {
  currentUser: User | null;
  authState: AuthState;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (newUser: Omit<User, 'id' | 'joinedDate' | 'status' | 'role'>) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_USERS_KEY = 'vigiatemp_admin_users';
const SESSION_USER_KEY = 'vigiatemp_session_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useSettings();

  useEffect(() => {
    // This effect now automatically logs in the admin user on application load.
    // This is done to bypass the login screen for easier development and testing,
    // as requested.
    try {
      const adminUser = demoUsers.find(u => u.role === 'Admin');
      if (adminUser) {
        setCurrentUser(adminUser);
        setAuthState('authenticated');
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(adminUser));
      } else {
        // Fallback in case the admin user isn't found in mock data
        console.error("Admin user not found in mock data.");
        setAuthState('unauthenticated');
      }
    } catch (error) {
      console.error("Error during automatic admin login:", error);
      setAuthState('unauthenticated');
    }
  }, []);

  // The login and signup functions are kept for potential future use,
  // but are not currently reachable as the app is always logged in as admin.
  const login = useCallback(async (email: string, password?: string): Promise<boolean> => {
    toast({ title: t('login.errorTitle', 'Error'), description: 'Login is currently disabled.', variant: 'destructive' });
    return false;
  }, [t, toast]);

  const signup = useCallback(async (newUser: Omit<User, 'id' | 'joinedDate' | 'status' | 'role'>): Promise<boolean> => {
    toast({ title: t('signup.errorTitle', 'Error'), description: 'Signup is currently disabled.', variant: 'destructive' });
    return false;
  }, [t, toast]);

  const logout = useCallback(() => {
    // This will clear the session, but a page refresh will automatically log the admin back in.
    // To truly log out, the automatic login in useEffect would need to be removed.
    setCurrentUser(null);
    setAuthState('unauthenticated');
    sessionStorage.removeItem(SESSION_USER_KEY);
    router.push('/login');
  }, [router]);

  const value = { currentUser, authState, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
