
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import type { User } from '@/types';

export type AuthState = 'admin'; // Only one state: always admin

interface AuthContextType {
  authState: AuthState;
  currentUser: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A default admin user to use when no login is required
const defaultAdminUser: User = {
    id: 'admin-default',
    name: 'Administrator',
    email: 'admin@vigiatemp.com',
    role: 'Admin',
    status: 'Active',
    joinedDate: new Date().toISOString(),
    tempCoins: 99999
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState: AuthState = 'admin';
  const currentUser: User = defaultAdminUser;
  
  // The login/logout logic and useEffect to check localStorage are removed.
  // The app is always in a logged-in (admin) state.

  const value = { authState, currentUser };

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
