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

// This variable will be true if the user has provided all the necessary Firebase keys.
const isFirebaseConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('...'); 

// This variable controls whether Firebase is used in the app.
// Forcing it to false to ensure the app uses local mock data as requested by the user
// to fix the user loading issue on Vercel.
const isFirebaseEnabled = false;

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Only initialize if the config is provided AND we want to enable it.
if (isFirebaseConfigured && isFirebaseEnabled && typeof window !== 'undefined') {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Provide dummy objects to prevent app from crashing if Firebase is not configured.
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
}


export { app, auth, db, isFirebaseEnabled, isFirebaseConfigured };
