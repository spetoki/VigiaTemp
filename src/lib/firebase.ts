// firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required Firebase config keys are present and not placeholders
const isFirebaseConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('...'); 

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.warn(`
    *************************************************************************
    *                           CONFIGURAÇÃO INCOMPLETA                     *
    *                                                                       *
    * A autenticação do Firebase está desativada.                           *
    * Para habilitar, configure as variáveis de ambiente do Firebase        *
    * no painel do seu projeto Vercel ou em um arquivo .env.local.          *
    *                                                                       *
    * Variáveis necessárias:                                                *
    *   - NEXT_PUBLIC_FIREBASE_API_KEY                                      *
    *   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN                                  *
    *   - NEXT_PUBLIC_FIREBASE_PROJECT_ID                                   *
    *   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET                               *
    *   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID                          *
    *   - NEXT_PUBLIC_FIREBASE_APP_ID                                       *
    *************************************************************************
  `);
  // Provide dummy objects to prevent app from crashing
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
}

const isFirebaseEnabled = isFirebaseConfigured;

export { app, auth, db, isFirebaseEnabled };
