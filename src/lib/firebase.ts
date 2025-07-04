// src/lib/firebase.ts
"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Your web app's Firebase configuration
// IMPORTANT: Make sure to fill in these values in your .env file
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

// Check if all required environment variables are present before initializing
// This prevents the app from crashing on the server if config is missing.
if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey.includes('...')) {
    console.warn("Firebase configuration is using placeholder keys. Please update your .env file with your actual Firebase project credentials.");
    // Provide dummy objects to prevent the app from crashing when auth is imported
    app = {} as FirebaseApp;
    auth = {} as Auth;
} else if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} else {
  console.warn("Firebase configuration is missing or incomplete. Firebase features will be disabled.");
  // Provide dummy objects to prevent the app from crashing when auth is imported
  app = {} as FirebaseApp;
  auth = {} as Auth;
}

export { app, auth };
