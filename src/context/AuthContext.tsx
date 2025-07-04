
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
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
const SESSION_KEY = 'vigiatemp_session';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useSettings();

  useEffect(() => {
    try {
      const sessionUserJson = localStorage.getItem(SESSION_KEY);
      if (sessionUserJson) {
        const user = JSON.parse(sessionUserJson);
        setCurrentUser(user);
        setAuthState('authenticated');
      } else {
        setAuthState('unauthenticated');
      }
    } catch (error) {
      console.error("Failed to parse session user from localStorage", error);
      setAuthState('unauthenticated');
    }
  }, []);

  const findUser = (email: string): User | undefined => {
    const storedUsersRaw = localStorage.getItem(LS_USERS_KEY);
    const allUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [...demoUsers];
    return allUsers.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
  };
  
  const login = async (email: string, password?: string): Promise<boolean> => {
    // Special case for admin login without a password for demo purposes
    if (email.toLowerCase() === 'admin' && password?.toLowerCase() === 'admin') {
        const adminUser = demoUsers.find(u => u.email === 'admin');
        if (adminUser) {
            setCurrentUser(adminUser);
            setAuthState('authenticated');
            localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
            toast({ title: t('login.adminSuccess', 'Admin login successful! Redirecting...') });
            router.push('/');
            return true;
        }
    }
    
    // Standard user login
    const user = findUser(email);

    if (user && user.password === password) {
       if (user.status === 'Pending') {
         toast({ title: t('login.errorTitle', 'Error'), description: t('login.pendingApproval', "Your account is pending administrator approval."), variant: 'destructive' });
         return false;
       }
       if (user.status === 'Inactive') {
         toast({ title: t('login.errorTitle', 'Error'), description: t('login.inactiveAccount', "This account is inactive."), variant: 'destructive' });
         return false;
       }
      
      setCurrentUser(user);
      setAuthState('authenticated');
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      toast({ title: t('login.userSuccess', 'Login successful!') });
      router.push('/');
      return true;
    }
    
    toast({ title: t('login.errorTitle', 'Error'), description: t('login.authError', "Invalid email or password."), variant: 'destructive' });
    return false;
  };

  const signup = async (newUser: Omit<User, 'id' | 'joinedDate' | 'status' | 'role'>): Promise<boolean> => {
     const storedUsersRaw = localStorage.getItem(LS_USERS_KEY);
     const allUsers: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [...demoUsers];

     if (allUsers.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
        toast({ title: t('signup.errorTitle', 'Error'), description: t('signup.emailInUse', 'This email is already in use.'), variant: 'destructive' });
        return false;
     }

     const finalNewUser: User = {
        ...newUser,
        id: `user-${Date.now()}`,
        role: 'User',
        status: 'Pending',
        joinedDate: new Date().toISOString(),
        tempCoins: 0,
     };
     
     const updatedUsers = [...allUsers, finalNewUser];
     localStorage.setItem(LS_USERS_KEY, JSON.stringify(updatedUsers));
     
     toast({ title: t('signup.successTitle', 'Success!'), description: t('signup.successPendingApproval', 'Account created successfully! Your account is pending administrator approval and will be activated soon.') });
     router.push('/login');
     return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthState('unauthenticated');
    localStorage.removeItem(SESSION_KEY);
    router.push('/login');
  };

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
