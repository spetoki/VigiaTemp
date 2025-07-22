

'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, AuthState } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/context/SettingsContext';
import { demoUsers } from '@/lib/mockData';

interface AuthContextType {
  currentUser: User | null;
  authState: AuthState;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (newUser: Omit<User, 'id' | 'joinedDate' | 'status' | 'role' | 'tempCoins' | 'accessExpiresAt'>) => Promise<boolean>;
  logout: () => void;
  fetchUsers: () => Promise<User[]>;
  updateUser: (user: User) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_USER_KEY = 'vigiatemp_session_user';
const ALL_USERS_KEY = 'vigiatemp_all_users';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useSettings();

  const seedInitialUsers = useCallback(() => {
    const storedUsers = localStorage.getItem(ALL_USERS_KEY);
    if (!storedUsers) {
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(demoUsers));
    }
  }, []);

  useEffect(() => {
    seedInitialUsers();
    
    const sessionUserJson = sessionStorage.getItem(SESSION_USER_KEY);
    if (sessionUserJson) {
      const sessionUser: User = JSON.parse(sessionUserJson);
      setCurrentUser(sessionUser);
      setAuthState('authenticated');
    } else {
      setAuthState('unauthenticated');
    }
  }, [seedInitialUsers]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    const allUsers: User[] = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
      if (user.status !== 'Active') {
        toast({ title: t('login.errorTitle', 'Login Error'), description: user.status === 'Pending' ? t('login.pendingApproval', 'Your account is pending administrator approval.') : t('login.inactiveAccount', 'This account is inactive.'), variant: "destructive" });
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
  };

  const signup = async (newUser: Omit<User, 'id' | 'joinedDate' | 'status' | 'role' | 'tempCoins' | 'accessExpiresAt'>): Promise<boolean> => {
    const allUsers: User[] = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
    if (allUsers.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
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
    const updatedUsers = [...allUsers, finalNewUser];
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(updatedUsers));
    toast({ title: t('signup.successTitle', 'Sucesso!'), description: t('signup.successPendingApproval', 'Conta criada com sucesso! Sua conta está pendente de aprovação por um administrador e será ativada em breve.') });
    router.push('/login');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthState('unauthenticated');
    sessionStorage.removeItem(SESSION_USER_KEY);
    router.push('/login');
  };

  const fetchUsers = async (): Promise<User[]> => {
    try {
        const usersJson = localStorage.getItem(ALL_USERS_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
        console.error("Error fetching users from localStorage:", error);
        return [];
    }
  };

  const updateUser = async (user: User): Promise<boolean> => {
    const allUsers: User[] = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
    const updatedUsers = allUsers.map(u => u.id === user.id ? user : u);
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(updatedUsers));
    if (currentUser?.id === user.id) {
      setCurrentUser(user);
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    }
    return true;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    const allUsers: User[] = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
    const updatedUsers = allUsers.filter(u => u.id !== userId);
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(updatedUsers));
    return true;
  };

  const value = { currentUser, authState, login, signup, logout, fetchUsers, updateUser, deleteUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
