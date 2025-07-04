
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
    // This effect runs on mount to check for an existing session.
    // It's safe to use localStorage/sessionStorage here.
    try {
      // Ensure demo users are in localStorage if it's empty
      const storedUsers = localStorage.getItem(LS_USERS_KEY);
      if (!storedUsers) {
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(demoUsers));
      }

      const sessionUserJson = sessionStorage.getItem(SESSION_USER_KEY);
      if (sessionUserJson) {
        const user: User = JSON.parse(sessionUserJson);
        setCurrentUser(user);
        setAuthState('authenticated');
      } else {
        setAuthState('unauthenticated');
      }
    } catch (error) {
      console.error("Error reading from storage:", error);
      setAuthState('unauthenticated');
    }
  }, []);

  const login = useCallback(async (email: string, password?: string): Promise<boolean> => {
    if (!password) {
      toast({ title: t('login.errorTitle', 'Error'), description: "Password is required.", variant: 'destructive' });
      return false;
    }

    const users: User[] = JSON.parse(localStorage.getItem(LS_USERS_KEY) || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user && user.password === password) {
      if (user.status !== 'Active') {
        toast({ title: t('login.errorTitle', 'Error'), description: t(user.status === 'Pending' ? 'login.pendingApproval' : 'login.inactiveAccount', "Account not active."), variant: 'destructive' });
        return false;
      }
      setCurrentUser(user);
      setAuthState('authenticated');
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
      toast({ title: t('login.userSuccess', 'Login successful!') });
      router.push('/');
      return true;
    } else {
      toast({ title: t('login.errorTitle', 'Error'), description: t('login.authError', "Invalid email or password."), variant: 'destructive' });
      return false;
    }
  }, [t, toast, router]);

  const signup = useCallback(async (newUser: Omit<User, 'id' | 'joinedDate' | 'status' | 'role'>): Promise<boolean> => {
    const allUsers: User[] = JSON.parse(localStorage.getItem(LS_USERS_KEY) || '[]');
    const emailExists = allUsers.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());

    if (emailExists) {
      toast({ title: t('signup.errorTitle', 'Error'), description: t('signup.emailInUse', 'This email is already in use.'), variant: 'destructive' });
      return false;
    }

    const finalNewUser: User = {
      ...newUser,
      id: `user-${Date.now()}`,
      joinedDate: new Date().toISOString(),
      status: 'Active', // Default to Active for simplicity in simulated mode
      role: 'User',
      tempCoins: 0,
    };

    const updatedUsers = [...allUsers, finalNewUser];
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(updatedUsers));
    
    toast({ title: t('signup.successTitle', 'Success!'), description: "Account created successfully. You can now log in." });
    router.push('/login');
    return true;
  }, [t, toast, router]);

  const logout = useCallback(() => {
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
