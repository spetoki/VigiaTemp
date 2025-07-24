// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import dotenv from 'dotenv';

dotenv.config({ path: `.env.local` });

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Function to check if the config is valid
const isConfigValid = (config: FirebaseOptions): boolean => {
    return !!(config.apiKey && config.projectId);
};

// Initialize Firebase
let app;
let db;

if (isConfigValid(firebaseConfig)) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
} else {
    console.error("Firebase config is invalid. Please check your .env.local file.");
    // We provide mock/dummy instances so the app doesn't crash on import
    // for developers who haven't set up their Firebase account yet.
    app = undefined;
    db = undefined;
}


export { app, db };
