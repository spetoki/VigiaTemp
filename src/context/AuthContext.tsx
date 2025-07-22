
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, AuthState } from '@/types';
import { isFirebaseEnabled, db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/context/SettingsContext';
import { demoUsers } from '@/lib/mockData';

interface AuthContextType {
  currentUser: User | null;
  authState: AuthState;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (newUser: Omit<User, 'id' | 'joinedDate'>) => Promise<string | null>;
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

  const seedUsersForDemo = useCallback(() => {
    // This function seeds users into localStorage for the demo mode
    const storedUsers = localStorage.getItem(ALL_USERS_KEY);
    if (!storedUsers) {
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(demoUsers));
    }
  }, []);

  const seedInitialUsersForFirebase = useCallback(async () => {
    if (!isFirebaseEnabled) return;
    try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        if (snapshot.empty) {
            console.log("No users found in Firestore, seeding from mockData...");
            for (const user of demoUsers) {
                // Don't include the placeholder ID when creating documents
                const { id, ...userData } = user;
                await addDoc(usersRef, userData);
            }
        }
    } catch (error) {
        console.error("Error seeding initial users:", error);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      if (isFirebaseEnabled) {
        await seedInitialUsersForFirebase();
        const sessionUserJson = sessionStorage.getItem(SESSION_USER_KEY);
        if (sessionUserJson) {
          const sessionUser: User = JSON.parse(sessionUserJson);
          try {
            const userDocRef = doc(db, "users", sessionUser.id);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const freshUserData = { id: userDoc.id, ...userDoc.data() } as User;
              if (freshUserData.status === 'Active') {
                setCurrentUser(freshUserData);
                setAuthState('authenticated');
              } else {
                throw new Error("User is not active.");
              }
            } else {
              throw new Error("User not found in database.");
            }
          } catch (e) {
            sessionStorage.removeItem(SESSION_USER_KEY);
            setAuthState('unauthenticated');
          }
        } else {
          setAuthState('unauthenticated');
        }
      } else {
        // --- DEMO MODE ---
        seedUsersForDemo();
        const sessionUserJson = sessionStorage.getItem(SESSION_USER_KEY);
        if (sessionUserJson) {
          const sessionUser = JSON.parse(sessionUserJson);
          setCurrentUser(sessionUser);
          setAuthState('authenticated');
        } else {
          setAuthState('unauthenticated');
        }
      }
    };
    initializeAuth();
  }, [seedInitialUsersForFirebase, seedUsersForDemo]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    if (isFirebaseEnabled) {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email), where("password", "==", password));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          toast({ title: t('login.errorTitle', 'Login Error'), description: t('login.authError', 'Invalid email or password.'), variant: 'destructive' });
          return false;
        }

        const userDoc = querySnapshot.docs[0];
        const user = { id: userDoc.id, ...userDoc.data() } as User;

        if (user.status !== 'Active') {
          toast({ title: t('login.errorTitle', 'Login Error'), description: t('login.inactiveAccount', 'This account is inactive.'), variant: "destructive" });
          return false;
        }

        setCurrentUser(user);
        setAuthState('authenticated');
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
        toast({ title: t('login.successTitle', 'Success'), description: t('login.userSuccess', 'Login successful!') });
        router.push('/');
        return true;
      } catch (error) {
        console.error("Firebase login failed:", error);
        toast({ title: t('login.errorTitle', 'Login Error'), description: "Ocorreu um erro durante o login.", variant: 'destructive' });
        return false;
      }
    } else {
      // --- DEMO MODE LOGIN ---
      const allUsers: User[] = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
      const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (user) {
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
    }
  };

  const signup = async (newUser: Omit<User, 'id' | 'joinedDate'>): Promise<string | null> => {
    if (!isFirebaseEnabled) {
      toast({ title: t('signup.errorTitle', 'Error'), description: "Firebase não está configurado. Cadastro desabilitado.", variant: "destructive" });
      return null;
    }
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", newUser.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast({ title: t('signup.errorTitle', 'Error'), description: t('signup.emailInUse', 'This email is already in use.'), variant: "destructive" });
        return null;
      }
      const docRef = await addDoc(collection(db, "users"), { ...newUser, joinedDate: new Date().toISOString() });
      return docRef.id;
    } catch (error) {
      console.error("Error creating user:", error);
      toast({ title: t('signup.errorTitle', 'Error'), description: "Não foi possível criar o usuário.", variant: "destructive" });
      return null;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthState('unauthenticated');
    sessionStorage.removeItem(SESSION_USER_KEY);
    router.push('/login');
  };

  const fetchUsers = async (): Promise<User[]> => {
    if (isFirebaseEnabled) {
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        if (snapshot.empty) return demoUsers; // Fallback
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
      } catch (error) {
        console.error("Error fetching users from Firestore, falling back to mock data:", error);
        return demoUsers; // Fallback
      }
    } else {
      // --- DEMO MODE FETCH ---
      return JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
    }
  };

  const updateUser = async (user: User): Promise<boolean> => {
    if (isFirebaseEnabled) {
      try {
        const userRef = doc(db, "users", user.id);
        const { id, ...userData } = user;
        await updateDoc(userRef, { ...userData });
        return true;
      } catch (error) {
        console.error("Error updating user in Firebase:", error);
        return false;
      }
    } else {
      // --- DEMO MODE UPDATE ---
      const allUsers: User[] = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
      const updatedUsers = allUsers.map(u => u.id === user.id ? user : u);
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(updatedUsers));
      return true;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    if (isFirebaseEnabled) {
      try {
        const userRef = doc(db, "users", userId);
        await deleteDoc(userRef);
        return true;
      } catch (error) {
        console.error("Error deleting user in Firebase:", error);
        return false;
      }
    } else {
      // --- DEMO MODE DELETE ---
      const allUsers: User[] = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
      const updatedUsers = allUsers.filter(u => u.id !== userId);
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(updatedUsers));
      return true;
    }
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
