
"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: ReturnType<typeof getFirestore>;
let isFirebaseEnabled = false;

// Check if all required environment variables are present and not placeholders
const requiredConfigs = [
    'apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'
] as const;

const missingConfigs = requiredConfigs.filter(key => !firebaseConfig[key] || firebaseConfig[key] === undefined);

if (missingConfigs.length === 0 && !firebaseConfig.apiKey?.includes('...')) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseEnabled = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    // Keep isFirebaseEnabled as false and provide dummy objects
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as ReturnType<typeof getFirestore>;
  }
} else {
  if (missingConfigs.length > 0) {
      console.warn(`Firebase is disabled because the following environment variables are missing in your .env file: ${missingConfigs.join(', ')}.`);
  } else {
      console.warn("Firebase configuration appears to be using placeholder values in your .env file. Please replace them with your actual Firebase project keys. Firebase features will be disabled.");
  }
  // Provide dummy objects to prevent the app from crashing on import
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as ReturnType<typeof getFirestore>;
}

export { app, auth, isFirebaseEnabled, db };
