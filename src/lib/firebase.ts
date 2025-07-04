// src/lib/firebase.ts
"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

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
let isFirebaseEnabled = false;

// Check if all required environment variables are present and not placeholders
if (
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('...') // Important: check for placeholder
) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    isFirebaseEnabled = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    // Keep isFirebaseEnabled as false and provide dummy objects
    app = {} as FirebaseApp;
    auth = {} as Auth;
  }
} else {
  console.warn("Firebase configuration is missing or incomplete (using placeholders). Firebase features will be disabled.");
  // Provide dummy objects to prevent the app from crashing on import
  app = {} as FirebaseApp;
  auth = {} as Auth;
}

export { app, auth, isFirebaseEnabled };
