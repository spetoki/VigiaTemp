
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, AuthState } from '@/types';
import { demoUsers } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/context/SettingsContext';
import { isFirebaseEnabled, db } from '@/lib/firebase';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc,
  query,
  where,
  setDoc,
  getDoc
} from 'firebase/firestore';


interface AuthContextType {
  currentUser: User | null;
  authState: AuthState;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (newUser: Omit<User, 'id' | 'joinedDate' | 'status' | 'role' | 'accessExpiresAt'>) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_USER_KEY = 'vigiatemp_session_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useSettings();
  
  // Seed database on first load if it's empty
  const seedDatabase = useCallback(async () => {
    if (!isFirebaseEnabled) return;
    try {
      const usersCol = collection(db, 'users');
      const userSnapshot = await getDocs(usersCol);
      if (userSnapshot.empty) {
        console.log("Firestore 'users' collection is empty. Seeding with demo data...");
        for (const user of demoUsers) {
          // Use email as document ID for admin for predictability, random for others.
          const docRef = user.role === 'Admin' ? doc(db, 'users', user.email) : doc(collection(db, 'users'));
          await setDoc(docRef, { ...user, id: docRef.id });
        }
        console.log("Seeding complete.");
      }
    } catch (error) {
      console.error("Error seeding Firestore database:", error);
    }
  }, []);


  useEffect(() => {
    const initializeAuth = async () => {
        if (!isFirebaseEnabled) {
            console.warn("Firebase is disabled. Auth will not work.");
            setAuthState('unauthenticated');
            return;
        }

        await seedDatabase();

        const sessionUserJson = sessionStorage.getItem(SESSION_USER_KEY);
        if (sessionUserJson) {
          const sessionUser: User = JSON.parse(sessionUserJson);
          
          if (sessionUser.accessExpiresAt && new Date(sessionUser.accessExpiresAt) < new Date()) {
            sessionStorage.removeItem(SESSION_USER_KEY);
            setAuthState('unauthenticated');
            toast({ title: t('auth.expired.title', 'Acesso Expirado'), description: t('auth.expired.description', 'Sua assinatura expirou. Entre em contato com o suporte.'), variant: "destructive" });
            return;
          }

          const userDocRef = doc(db, "users", sessionUser.id);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
              const freshUserData = { id: userDoc.id, ...userDoc.data() } as User;
              if (freshUserData.status === 'Active') {
                 setCurrentUser(freshUserData);
                 setAuthState('authenticated');
              } else {
                 sessionStorage.removeItem(SESSION_USER_KEY);
                 setAuthState('unauthenticated');
                 if(freshUserData.status !== 'Active') {
                    toast({ title: t('login.errorTitle', 'Login Error'), description: freshUserData.status === 'Pending' ? t('login.pendingApproval', 'Your account is pending administrator approval.') : t('login.inactiveAccount', 'This account is inactive.'), variant: "destructive" });
                 }
              }
          } else {
            sessionStorage.removeItem(SESSION_USER_KEY);
            setAuthState('unauthenticated');
          }
        } else {
            setAuthState('unauthenticated');
        }
    };
    
    initializeAuth();
  }, [seedDatabase, t, toast]);

  const login = useCallback(async (email: string, password?: string): Promise<boolean> => {
    if (!isFirebaseEnabled) {
      toast({ title: "Firebase Desabilitado", description: "A autenticação requer configuração das chaves de API no Vercel.", variant: "destructive"});
      return false;
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.toLowerCase()));
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        toast({ title: t('login.errorTitle', 'Login Error'), description: t('login.authError', 'Invalid email or password.'), variant: 'destructive' });
        return false;
    }

    const userDoc = querySnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as User;

    if (user.password === password) {
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
    if (!isFirebaseEnabled) {
      toast({ title: "Firebase Desabilitado", description: "O cadastro de usuários requer configuração das chaves de API no Vercel.", variant: "destructive"});
      return false;
    }
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", newUser.email.toLowerCase()));
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      toast({ title: t('signup.errorTitle', 'Error'), description: t('signup.emailInUse', 'This email is already in use.'), variant: "destructive" });
      return false;
    }
    
    const finalNewUser: Omit<User, 'id'> = {
      ...newUser,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      role: 'User',
      tempCoins: 0,
      accessExpiresAt: undefined,
    };

    try {
      await addDoc(collection(db, "users"), finalNewUser);
      toast({ title: t('signup.successTitle', 'Sucesso!'), description: t('signup.successPendingApproval', 'Conta criada com sucesso! Sua conta está pendente de aprovação por um administrador e será ativada em breve.') });
      router.push('/login');
      return true;
    } catch (error) {
       console.error("Error adding user to Firestore:", error);
       toast({ title: "Signup Error", description: "Could not create account. Please try again.", variant: "destructive" });
       return false;
    }
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
