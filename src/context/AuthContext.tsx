
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
    // Para fins de teste, esta seção força o login com 'spetoki@gmail.com' ao carregar o aplicativo.
    // Em uma aplicação real, você removeria esta lógica e leria o estado de `localStorage`.
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
        // Se spetoki@gmail.com não for encontrado, volte para o estado não autenticado.
        logout();
      }
    } catch (error) {
      console.error("Could not access localStorage. Defaulting to unauthenticated.", error);
      logout();
    }
  }, [logout]);

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
  }, [logout]);

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
    