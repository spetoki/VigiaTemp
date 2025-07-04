
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
  signup: (newUser: Omit<User, 'id' | 'joinedDate' | 'status' | 'role' | 'accessExpiresAt'>) => Promise<boolean>;
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
    try {
      const storedUsersRaw = localStorage.getItem(LS_USERS_KEY);
      let users: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

      if (users.length === 0) {
        users = demoUsers;
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
      } else {
        const adminUserIndex = users.findIndex(u => u.role === 'Admin' || u.email === 'admin');
        const demoAdmin = demoUsers.find(u => u.email === 'admin');

        if (demoAdmin) {
          if (adminUserIndex !== -1) {
            const adminUser = users[adminUserIndex];
            if (adminUser.email !== demoAdmin.email || adminUser.password !== demoAdmin.password) {
              users[adminUserIndex] = { ...adminUser, email: demoAdmin.email, password: demoAdmin.password };
              localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
            }
          } else {
            users.unshift(demoAdmin);
            localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
          }
        }
      }

      const sessionUserJson = sessionStorage.getItem(SESSION_USER_KEY);
      if (sessionUserJson) {
        const sessionUser: User = JSON.parse(sessionUserJson);
        const userInStorage = users.find(u => u.id === sessionUser.id);
        
        // Check for access expiration on session load
        if (sessionUser.accessExpiresAt && new Date(sessionUser.accessExpiresAt) < new Date()) {
          toast({
            title: t('auth.expired.title', 'Acesso Expirado'),
            description: t('auth.expired.description', 'Sua assinatura expirou. Entre em contato com o suporte.'),
            variant: "destructive"
          });
          sessionStorage.removeItem(SESSION_USER_KEY);
          setAuthState('unauthenticated');
        } else if (userInStorage && userInStorage.status === 'Active') {
          setCurrentUser(userInStorage);
          setAuthState('authenticated');
        } else {
          sessionStorage.removeItem(SESSION_USER_KEY);
          setAuthState('unauthenticated');
        }
      } else {
        setAuthState('unauthenticated');
      }
    } catch (error) {
      console.error("Error initializing auth state, resetting for safety:", error);
      localStorage.setItem(LS_USERS_KEY, JSON.stringify(demoUsers));
      sessionStorage.removeItem(SESSION_USER_KEY);
      setAuthState('unauthenticated');
    }
  }, [t]);

  const login = useCallback(async (email: string, password?: string): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem(LS_USERS_KEY) || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
        if (user.status !== 'Active') {
            toast({ title: t('login.errorTitle', 'Login Error'), description: user.status === 'Pending' ? t('login.pendingApproval', 'Your account is pending administrator approval.') : t('login.inactiveAccount', 'This account is inactive.'), variant: "destructive" });
            return false;
        }

        if (user.accessExpiresAt && new Date(user.accessExpiresAt) < new Date()) {
            toast({
              title: t('auth.expired.title', 'Acesso Expirado'),
              description: t('auth.expired.description', 'Sua assinatura expirou. Entre em contato com o suporte.'),
              variant: "destructive"
            });
            return false;
        }

        setCurrentUser(user);
        setAuthState('authenticated');
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
        toast({ title: t('login.successTitle', 'Success'), description: t('login.userSuccess', 'Login successful!') });
        router.push('/');
        return true;
    } else {
      toast({ title: t('login.errorTitle', 'Login Error'), description: t('login.authError', 'Invalid email or password.'), variant: 'destructive' });
      return false;
    }
  }, [router, t, toast]);

  const signup = useCallback(async (newUser: Omit<User, 'id' | 'joinedDate' | 'status' | 'role' | 'accessExpiresAt'>): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem(LS_USERS_KEY) || '[]');
    const existingUser = users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase());

    if (existingUser) {
      toast({ title: t('signup.errorTitle', 'Error'), description: t('signup.emailInUse', 'This email is already in use.'), variant: "destructive" });
      return false;
    }
    
    const finalNewUser: User = {
      ...newUser,
      id: `user-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      role: 'User',
      tempCoins: 0,
      accessExpiresAt: undefined,
    };

    users.unshift(finalNewUser);
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
    
    toast({ title: t('signup.successTitle', 'Sucesso!'), description: t('signup.successPendingApproval', 'Conta criada com sucesso! Sua conta está pendente de aprovação por um administrador e será ativada em breve.') });
    router.push('/login');
    return true;
  }, [router, t, toast]);


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
