
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User, AuthState } from '@/types';
import { demoUsers } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from './SettingsContext';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
} from 'firebase/auth';
// Import auth and the new flag from firebase lib
import { auth, isFirebaseEnabled } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  authState: AuthState;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (newUser: Omit<User, 'id' | 'joinedDate' | 'status' | 'role'>) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_USERS_KEY = 'vigiatemp_admin_users';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useSettings();

  useEffect(() => {
    // Ensure demo users are in localStorage if it's empty
    const storedUsers = localStorage.getItem(LS_USERS_KEY);
    if (!storedUsers) {
      localStorage.setItem(LS_USERS_KEY, JSON.stringify(demoUsers));
    }

    if (!isFirebaseEnabled) {
      console.warn("Firebase is not enabled. Authentication will be disabled.");
      setAuthState('unauthenticated');
      // No need to set up a listener if Firebase isn't configured.
      return; 
    }
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, find their profile in our user list
        const users: User[] = JSON.parse(localStorage.getItem(LS_USERS_KEY) || '[]');
        const appUser = users.find(u => u.id === firebaseUser.uid);

        if (appUser) {
          if (appUser.status === 'Active') {
            setCurrentUser({
              ...appUser,
              name: firebaseUser.displayName || appUser.name,
              email: firebaseUser.email || appUser.email,
            });
            setAuthState('authenticated');
          } else {
             toast({ title: t('login.errorTitle', 'Error'), description: t(appUser.status === 'Pending' ? 'login.pendingApproval' : 'login.inactiveAccount', "Account not active."), variant: 'destructive' });
             signOut(auth); // Sign out user if not active
             setAuthState('unauthenticated');
          }
        } else {
          // This case handles users that exist in Firebase Auth but not in our local user list.
          const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
              email: firebaseUser.email!,
              role: 'User',
              status: 'Pending', // Default status, requires admin approval
              joinedDate: new Date().toISOString(),
              tempCoins: 0,
          };
          const updatedUsers = [...users, newUser];
          localStorage.setItem(LS_USERS_KEY, JSON.stringify(updatedUsers));
          toast({ title: t('login.errorTitle', 'Error'), description: t('login.pendingApproval', "Your account is pending administrator approval."), variant: 'destructive' });
          signOut(auth);
          setAuthState('unauthenticated');
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setAuthState('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, [t, toast]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    if (!isFirebaseEnabled) {
        toast({ title: t('login.errorTitle', 'Error'), description: "Firebase is not configured.", variant: 'destructive' });
        return false;
    }
    if (!password) {
      toast({ title: t('login.errorTitle', 'Error'), description: "Password is required.", variant: 'destructive' });
      return false;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: t('login.userSuccess', 'Login successful!') });
      router.push('/');
      return true;
    } catch (error: any) {
      console.error("Firebase Login Error:", error.code, error.message);
      toast({ title: t('login.errorTitle', 'Error'), description: t('login.authError', "Invalid email or password."), variant: 'destructive' });
      return false;
    }
  };

  const signup = async (newUser: Omit<User, 'id' | 'joinedDate' | 'status' | 'role'>): Promise<boolean> => {
    if (!isFirebaseEnabled) {
        toast({ title: t('signup.errorTitle', 'Error'), description: "Firebase is not configured. Signup is disabled.", variant: 'destructive' });
        return false;
    }
    const { name, email, password } = newUser;
    if (!password) return false;

    const allUsers: User[] = JSON.parse(localStorage.getItem(LS_USERS_KEY) || '[]');
    const preDefinedUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    // If user exists and has a real ID (not a placeholder), it's already taken.
    if (preDefinedUser && !preDefinedUser.id.includes('-placeholder-')) {
       toast({ title: t('signup.errorTitle', 'Error'), description: t('signup.emailInUse', 'This email is already in use.'), variant: 'destructive' });
       return false;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        await updateProfile(firebaseUser, { displayName: name });

        let userToSave: User;
        let toastDescription: string;
        let finalUsers: User[];

        if (preDefinedUser) {
            // "Claim" the predefined user
            userToSave = {
                ...preDefinedUser,
                id: firebaseUser.uid, // Set the real Firebase UID
                name: name // Update name from signup form
            };
            finalUsers = allUsers.map(u => u.email.toLowerCase() === preDefinedUser.email.toLowerCase() ? userToSave : u);
            toastDescription = `Conta de ${userToSave.role} ativada com sucesso! Você já pode fazer login.`;
        } else {
            // Create a new standard user that needs approval
            userToSave = {
                id: firebaseUser.uid,
                name,
                email,
                role: 'User',
                status: 'Pending',
                joinedDate: new Date().toISOString(),
                tempCoins: 0,
            };
            finalUsers = [...allUsers, userToSave];
            toastDescription = t('signup.successPendingApproval', 'Account created successfully! Your account is pending administrator approval and will be activated soon.');
        }

        localStorage.setItem(LS_USERS_KEY, JSON.stringify(finalUsers));
        
        await signOut(auth);
        toast({ title: t('signup.successTitle', 'Success!'), description: toastDescription });
        router.push('/login');
        return true;
    } catch (error: any) {
        console.error("Firebase Signup Error:", error);
        let message = "An unknown error occurred during signup.";
        if (error.code === 'auth/email-already-in-use') {
            // This case might be hit if the user was created in Firebase but something failed before finishing.
            // We tell them it's in use.
            message = t('signup.emailInUse', 'This email is already in use.');
        } else if (error.code === 'auth/weak-password') {
            message = t('signup.passwordMinLength', 'Password must be at least 6 characters.');
        }
        toast({ title: t('signup.errorTitle', 'Error'), description: message, variant: 'destructive' });
        return false;
    }
  };

  const logout = () => {
    if (isFirebaseEnabled) {
      signOut(auth);
    }
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
