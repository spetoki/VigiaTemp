
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// NOTE: O Next.js carrega automaticamente as variáveis de .env.local, 
// então não é necessário usar 'dotenv'.
// As variáveis precisam ser prefixadas com NEXT_PUBLIC_ para serem acessíveis no lado do cliente.
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
let app: FirebaseApp | undefined;
let db: Firestore | undefined;

// This check ensures we only try to initialize Firebase on the client-side
// or in server environments where the config is valid.
if (isConfigValid(firebaseConfig)) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        app = undefined;
        db = undefined;
    }
} else {
    console.warn("Firebase config is incomplete or invalid. The application will run without database features. Please check your environment variables (e.g., .env.local). They must be prefixed with NEXT_PUBLIC_.");
}


export { app, db };
